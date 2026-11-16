import { GoogleAuth } from 'google-auth-library';
import { NextResponse } from 'next/server';
import { parseRows } from '../../../lib/results';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const range = process.env.GOOGLE_SHEET_RANGE || "'Event Results'!A1:E1000";
    if (!email || !key || !sheetId) throw new Error('Google Sheets connection is not configured.');
    const auth = new GoogleAuth({ credentials: { client_email: email, private_key: key }, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    if (!token.token) throw new Error('Google authentication failed.');
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(range)}?valueRenderOption=FORMATTED_VALUE`;
    const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token.token}` }, cache: 'no-store' });
    if (!response.ok) throw new Error(`Google Sheets returned HTTP ${response.status}. Check sharing and configuration.`);
    const data = await response.json() as { values?: unknown[][] };
    const athletes = parseRows(data.values || []);
    return NextResponse.json({ athletes, updatedAt: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    console.error('Results fetch failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Results unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
