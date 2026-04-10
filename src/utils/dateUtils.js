/**
 * dateUtils.js — Centralized date formatting for the entire application.
 *
 * Rules:
 *  - All DISPLAY dates use DD/MM/YYYY (as required by the project standard).
 *  - API serialization (yyyy-MM-dd) is NOT handled here — leave `DatePickerField`
 *    emitting ISO strings to the backend as-is.
 *  - Every function is null/invalid-safe: returns a safe fallback string instead
 *    of throwing.
 *
 * Usage:
 *   import { formatDate, formatDateTime, formatDateTimeAmPm, toInputDate } from '../../utils/dateUtils'
 */

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Coerce any date-like value into a native Date, or null if invalid / empty.
 * @param {string|Date|number|null|undefined} value
 * @returns {Date|null}
 */
export const toDate = (value) => {
  if (!value && value !== 0) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

/** Zero-pad a number to 2 digits. */
const pad2 = (n) => String(n).padStart(2, '0');

// ─────────────────────────────────────────────────────────────────────────────
// Public display formatters
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a date value as DD/MM/YYYY.
 *
 * @param {string|Date|number|null|undefined} value
 * @param {string} [fallback='N/A'] — returned when value is null / invalid
 * @returns {string}  e.g. "10/04/2026"
 */
export const formatDate = (value, fallback = 'N/A') => {
  const d = toDate(value);
  if (!d) return fallback;
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/**
 * Format a datetime value as DD/MM/YYYY HH:MM (24-hour).
 *
 * @param {string|Date|number|null|undefined} value
 * @param {string} [fallback='N/A']
 * @returns {string}  e.g. "10/04/2026 14:35"
 */
export const formatDateTime = (value, fallback = 'N/A') => {
  const d = toDate(value);
  if (!d) return fallback;
  const date = `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return `${date} ${time}`;
};

/**
 * Format a datetime as two separate strings for two-line table cells:
 *   { time: "02:35 PM", date: "10/04/2026" }
 *
 * Used in tables that show time on the first line and date on the second line.
 *
 * @param {string|Date|number|null|undefined} value
 * @returns {{ time: string, date: string }|null}  null when value is invalid
 */
export const formatDateTimeAmPm = (value) => {
  const d = toDate(value);
  if (!d) return null;

  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  const time = `${pad2(hours12)}:${pad2(minutes)} ${ampm}`;
  const date = `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;

  return { time, date };
};

/**
 * Format a date as a short human-readable string: "10 Apr 2026"
 * (used in activity feeds / tooltips where space is tight)
 *
 * @param {string|Date|number|null|undefined} value
 * @param {string} [fallback='N/A']
 * @returns {string}
 */
export const formatDateShort = (value, fallback = 'N/A') => {
  const d = toDate(value);
  if (!d) return fallback;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${pad2(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// API / input helpers  (these do NOT produce DD/MM/YYYY — keep ISO for backend)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a Date object to a yyyy-MM-dd string for use with
 * <input type="date"> and API payloads.
 *
 * @param {Date} date
 * @returns {string}  e.g. "2026-04-10"
 */
export const toInputDate = (date) => {
  const d = toDate(date);
  if (!d) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

/**
 * Parse a yyyy-MM-dd string into a Date object (local timezone — no UTC shift).
 *
 * @param {string} str  e.g. "2026-04-10"
 * @returns {Date|null}
 */
export const parseInputDate = (str) => {
  if (!str) return null;
  const [y, m, day] = str.split('-').map(Number);
  if (!y || !m || !day) return null;
  const d = new Date(y, m - 1, day);
  return isNaN(d.getTime()) ? null : d;
};
