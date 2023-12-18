import { toParsedDateTime } from '~/helpers/dateTime';

export const getDateTime = (dateTime: string | Date) => {
  const [date, time] = toParsedDateTime(dateTime).split(' ');
  return `${date} / ${time}`;
};

export const isValidLink = (url: string) => {
  if (!url) return;
  if (url.startsWith('https') && !url.includes('{')) return url;
  return;
}