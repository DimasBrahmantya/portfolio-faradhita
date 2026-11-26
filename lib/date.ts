const ISO_TIMESTAMP_REGEX =
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})/g;

const ID_MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
});

const ID_FULL_DATE_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
});

const ID_DAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  timeZone: 'Asia/Jakarta',
});

function formatSingleIsoTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso.replace(/T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})/g, '');
  }

  const jakartaDay = Number(ID_DAY_FORMATTER.format(date));
  // Google Sheets converts "April 2025" into the 1st of that month at 00:00 WIB (which serializes as prev-day T17:00:00.000Z).
  if (jakartaDay === 1) {
    return ID_MONTH_YEAR_FORMATTER.format(date);
  }

  return ID_FULL_DATE_FORMATTER.format(date);
}

/**
 * Cleans ISO 8601 timestamps (such as `2025-03-31T17:00:00.000Z` produced when
 * Google Sheets auto-parses month/year cells) into clean Indonesian dates.
 */
export function cleanIsoDates(value: string): string {
  if (!value || !value.includes('T')) return value;
  return value.replace(ISO_TIMESTAMP_REGEX, (match) => formatSingleIsoTimestamp(match));
}
