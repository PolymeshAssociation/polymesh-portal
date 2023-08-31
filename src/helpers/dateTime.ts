import moment from 'moment';

export const toRelativeTime = (timestamp: number) => {
  return moment(timestamp).startOf('milliseconds').fromNow();
};

// Parse input to a local Date time string
// Input with an ambiguous timezone is assumed to be UTC
export const toParsedDateTime = (timestamp: Date | string | number) => {
  return moment.utc(timestamp).local().format('YYYY-MM-DD HH:mm:ss');
};

export const removeTimezoneOffset = (date: Date | null | undefined) => {
  return date ? new Date(date.toISOString().slice(0, -1)) : null;
};

export const toParsedDate = (timestamp: string | number) => {
  return moment(timestamp).format('MMM D, YYYY');
};
