import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';

// LeetCode API Logic
async function fetchLeetCode(username: string, year: number) {
  const SUBMISSION_CALENDAR_QUERY = `
    query userProfileCalendar($username: String!, $year: Int) {
      matchedUser(username: $username) {
        userCalendar(year: $year) {
          submissionCalendar
        }
      }
    }
  `;

  let response: Response;
  try {
    response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'Origin': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query: SUBMISSION_CALENDAR_QUERY,
        variables: { username, year },
      }),
    });
  } catch (err) {
    throw new Error('Failed to fetch LeetCode data');
  }

  if (!response.ok) throw new Error(`LeetCode API error: ${response.status}`);
  const data = await response.json();
  if (data.errors) throw new Error(data.errors[0]?.message || 'LeetCode API error');

  const user = data?.data?.matchedUser;
  if (!user) throw new Error(`LeetCode user "${username}" not found or private`);

  const calendarStr: string = user.userCalendar.submissionCalendar;
  const calendar: Record<string, number> = JSON.parse(calendarStr);

  const activities = [];
  const now = new Date().toISOString();
  const targetYear = year.toString();

  for (const [timestamp, count] of Object.entries(calendar)) {
    const date = new Date(parseInt(timestamp) * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    if (!dateStr.startsWith(targetYear)) continue;
    
    if (count > 0) {
      activities.push({
        id: `leetcode_${dateStr}`,
        provider: 'leetcode',
        date: dateStr,
        count,
        fetched_at: now,
      });
    }
  }

  return activities;
}

// GitHub API Logic
async function fetchGitHub(username: string, year: number, providedToken?: string) {
  // Use securely stored server-side token if available, otherwise fallback to provided
  const token = process.env.GITHUB_TOKEN || providedToken;
  
  if (!token) {
    throw new Error('A GitHub Personal Access Token is required on the server (GITHUB_TOKEN) to sync contributions via GraphQL API securely.');
  }

  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  const CONTRIBUTIONS_QUERY = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'DailyGrid-App'
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: { username, from, to },
    }),
  });

  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
  const data = await response.json();
  if (data.errors) throw new Error(data.errors[0]?.message || 'GitHub GraphQL error');

  const user = data?.data?.user;
  if (!user) throw new Error(`GitHub user "${username}" not found or private`);

  const weeks = user.contributionsCollection.contributionCalendar.weeks;
  const activities = [];
  const now = new Date().toISOString();

  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) {
        activities.push({
          id: `github_${day.date}`,
          provider: 'github',
          date: day.date,
          count: day.contributionCount,
          fetched_at: now,
        });
      }
    }
  }

  return activities;
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { provider, username, token, year } = req.body;
  if (!provider || !username) return res.status(400).json({ error: 'Missing provider or username' });

  const syncYear = year || new Date().getFullYear();
  let activities = [];

  try {
    if (provider === 'leetcode') {
      activities = await fetchLeetCode(username, syncYear);
    } else if (provider === 'github') {
      activities = await fetchGitHub(username, syncYear, token);
    } else {
      return res.status(400).json({ error: `Unknown provider ${provider}` });
    }

    if (activities.length > 0) {
      const { error: upsertError } = await supabase
        .from('external_activity')
        .upsert(activities, { onConflict: 'provider, date' });

      if (upsertError) throw new Error(upsertError.message);
    }

    const { error: updateError } = await supabase
      .from('integrations')
      .update({
        sync_status: 'success',
        last_synced_at: new Date().toISOString(),
        sync_error: null
      })
      .eq('id', provider);

    if (updateError) throw new Error(updateError.message);

    return res.status(200).json({ success: true, activities });

  } catch (error: any) {
    await supabase
      .from('integrations')
      .update({
        sync_status: 'error',
        sync_error: error.message || 'Sync failed'
      })
      .eq('id', provider);

    return res.status(500).json({ error: error.message });
  }
}
