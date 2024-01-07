import { toParsedDateTime } from '~/helpers/dateTime';

export const getDateTime = (dateTime: string | Date) => {
  const [date, time] = toParsedDateTime(dateTime).split(' ');
  return `${date} / ${time}`;
};

export const isValidLink = (url?: string | null | undefined) => {
  if (!url) return undefined;
  if (url.startsWith('https') && !url.includes('{')) return url;
  return undefined;
};
