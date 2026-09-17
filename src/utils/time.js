// Pure time helpers shared by the add form (App.js) and the edit form (TaskItem via App.js).

export const AM = '오전'; // internal constants — labels come from t('app.am') / t('app.pm')
export const PM = '오후';

/**
 * Build a "HH:MM" string from the 12-hour form fields.
 *
 *   hour only          → minutes default to 00        ("3", "", PM) → "15:00"
 *   minutes only       → no time (a minute alone is not a moment)
 *   hour 13–23         → taken as 24-hour input, AM/PM ignored  ("15", "30", AM) → "15:30"
 *   hour 0             → midnight, AM/PM ignored              ("0", "", PM) → "00:00"
 *   hour > 23 / NaN    → no time
 *   minutes > 59       → clamped to 59, < 0 → 0
 *
 * Always returns either a valid "HH:MM" or '' — never a half-formed value like "01:65".
 */
export const convertTo24Hour = (h, m, ampm) => {
  const hStr = String(h ?? '').trim();
  if (!hStr) return '';
  let hour = parseInt(hStr, 10);
  if (Number.isNaN(hour) || hour < 0 || hour > 23) return '';

  if (hour >= 1 && hour <= 12) {
    if (ampm === PM && hour < 12) hour += 12;
    if (ampm === AM && hour === 12) hour = 0;
  } // 0 and 13–23: already 24-hour, AM/PM ignored

  const mStr = String(m ?? '').trim();
  let minute = mStr ? parseInt(mStr, 10) : 0;
  if (Number.isNaN(minute)) minute = 0;
  minute = Math.min(59, Math.max(0, minute));

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};
