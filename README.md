# TSA HYROX Youngstars Live Leaderboards

A Next.js site for 8 live leaderboards, reading the existing private Google Sheet every 60 seconds. No spreadsheet credentials are sent to visitors.

## Sheet

Spreadsheet ID: `1C_0Tjrsx_rSGqb_SXqmbex4v0gxQIXINT6vNbRbDaxo`
Tab: `Event Results`
Columns: `Name | Gender | Age Band | Finish Time | Status`

**Important:** Only rows with `Status` exactly `Finished` and a valid positive finish time are ranked. Gender must be Male/Female, and age band must be `8/9`, `10/11`, `12/13`, or `14/15` (hyphens also accepted). Times can be `mm:ss`, `hh:mm:ss`, or seconds. **For reliable Google Sheets entry, format Finish Time column D as Plain text** and enter e.g. `18:42`; otherwise Google Sheets may interpret the input as a clock time and display a different value. For times over an hour, use `1:02:34` as text. Avoid entering formulas returning date serials. Ties share rank (competition ranking: 1,1,3).

## Setup: Google Cloud service account

1. Go to https://console.cloud.google.com/ and create or select a project.
2. Open **APIs & Services → Library**; enable **Google Sheets API**.
3. Open **IAM & Admin → Service Accounts** and create a service account named `hyrox-leaderboard-reader`.
4. Under the service account, go to **Keys → Add Key → Create new key → JSON**. Download the JSON privately. Never upload it to GitHub or share it in chat.
5. Open the existing Google Sheet and click **Share**. Add the JSON's `client_email` as a **Viewer** (not Editor).
6. In Vercel, add the environment variables listed below, copying `client_email` and `private_key` from the JSON. The private key should include its `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines. Paste with actual newlines or literal `\n`; both are supported.

## Deploy with GitHub + Vercel

1. Create a **private** GitHub repository named `tsa-hyrox-youngstars`.
2. Upload the **contents** of this project folder to the repository (not the ZIP itself). Include `app`, `lib`, `package.json`, `tsconfig.json`, `next-env.d.ts`, `.gitignore`, and README. Do not upload `.env.local`, private keys, or service-account JSON files.
3. In https://vercel.com/new choose **Import Git Repository**, authorize GitHub if asked, and select the repository.
4. Framework preset should detect **Next.js**. Keep root directory at `./`.
5. Under **Environment Variables**, add:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` = JSON `client_email`
   - `GOOGLE_PRIVATE_KEY` = JSON `private_key`
   - `GOOGLE_SHEET_ID` = `1C_0Tjrsx_rSGqb_SXqmbex4v0gxQIXINT6vNbRbDaxo`
   - `GOOGLE_SHEET_RANGE` = `'Event Results'!A1:E1000`
6. Click **Deploy**. Vercel provides a `*.vercel.app` URL.
7. Open `/api/results` on the deployed site. You should see a JSON object with `athletes` and `updatedAt`. If it returns HTTP 503, check the Google API, service-account email sharing, and private key settings.
8. Test with a **temporary** finish time in the sheet and `Status = Finished`, then verify it appears on the site within 60 seconds. Restore the original cells afterward. Check a phone and event TV.

**Security:** Keep the service account JSON out of GitHub and out of public chat. The endpoint intentionally returns only participant name, gender, age band, finish time, status, and row identifier. Ensure you have appropriate school/guardian authorization to publish minor participants' display names and results. Use initials or approved display names where necessary. The endpoint is public because spectators need the leaderboard; it never returns the service-account key.

## Local development (optional)

Requires Node.js 20+. Run `npm install`, copy `.env.example` to `.env.local`, fill in credentials, then `npm run dev` and visit http://localhost:3000.

## Notes

- Refresh occurs every 60 seconds while the page is open, and when the tab becomes visible again. The timestamp shows the last successful fetch from Google, not necessarily the last edit in Sheets.
- If Google fails, the UI shows an explicit connection issue and labels any previously loaded data as potentially outdated.
- The website is responsive: 4 boards across on wide TVs, 2 on tablets, 1 on phones. Focus mode allows selecting one division.
- The browser's Fullscreen button may require permission or be unavailable in some embedded browsers.
- If you update environment variables after deploying, redeploy in Vercel for them to take effect.
