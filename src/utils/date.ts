const argentinaDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Argentina/Buenos_Aires',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function getArgentinaDate(date: Date): string {
  return argentinaDateFormatter.format(date);
}

export function hasDateStarted(eventDate: Date, currentDate: Date): boolean {
  return currentDate >= eventDate;
}
