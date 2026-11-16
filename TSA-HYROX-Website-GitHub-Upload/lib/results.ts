export type Gender = 'Male' | 'Female';
export type AgeBand = '8/9' | '10/11' | '12/13' | '14/15';
export type Athlete = { id: string; name: string; gender: Gender; ageBand: AgeBand; seconds: number | null; time: string | null; status: string };
export const ageBands: AgeBand[] = ['8/9','10/11','12/13','14/15'];
export const genders: Gender[] = ['Male','Female'];
export function parseTime(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  // Google Sheets FORMATTED_VALUE typically returns mm:ss or hh:mm:ss.
  const s = String(value).trim();
  if (!s) return null;
  const parts = s.split(':');
  if (parts.length === 2 || parts.length === 3) {
    if (!parts.every(p => /^\d+(?:\.\d+)?$/.test(p))) return null;
    const nums = parts.map(Number);
    if (nums.slice(1).some(n => n >= 60) || nums.some(n => n < 0)) return null;
    const seconds = nums.reduce((acc, n) => acc * 60 + n, 0);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
  }
  // Plain seconds are supported. Never interpret spreadsheet date/time serials as seconds.
  if (/^\d+(?:\.\d+)?$/.test(s)) {
    const n = Number(s);
    return n > 0 && Number.isFinite(n) ? n : null;
  }
  return null;
}
export function formatTime(seconds: number): string {
  const whole = Math.floor(seconds);
  const h = Math.floor(whole / 3600), m = Math.floor((whole % 3600) / 60), s = whole % 60;
  const tail = `${String(m).padStart(h ? 2 : 1,'0')}:${String(s).padStart(2,'0')}`;
  const frac = seconds % 1 ? `.${Math.round((seconds % 1)*100).toString().padStart(2,'0')}` : '';
  return h ? `${h}:${tail}${frac}` : `${tail}${frac}`;
}
export function parseRows(rows: unknown[][]): Athlete[] {
  const header = (rows[0] || []).map(v => String(v ?? '').trim().toLowerCase());
  const indexes = ['name','gender','age band','finish time','status'].map(h => header.indexOf(h));
  if (indexes.some(i => i < 0)) throw new Error('Sheet must have Name, Gender, Age Band, Finish Time, Status headers.');
  return rows.slice(1).flatMap((row, i) => {
    const [nameI, genderI, ageI, timeI, statusI] = indexes;
    const name = String(row[nameI] ?? '').trim();
    const genderRaw = String(row[genderI] ?? '').trim().toLowerCase();
    const gender = genderRaw === 'male' || genderRaw === 'm' ? 'Male' : genderRaw === 'female' || genderRaw === 'f' ? 'Female' : null;
    const ageRaw = String(row[ageI] ?? '').trim().replace(/\s/g,'').replace(/[–—-]/g,'/');
    const ageBand = ageBands.find(b => b === ageRaw);
    if (!name || !gender || !ageBand) return [];
    const status = String(row[statusI] ?? '').trim();
    const seconds = /^finished$/i.test(status) ? parseTime(row[timeI]) : null;
    return [{ id: String(i + 2), name, gender, ageBand, status, seconds, time: seconds === null ? null : formatTime(seconds) }];
  });
}
