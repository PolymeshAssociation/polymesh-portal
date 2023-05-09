import moment from 'moment';

export const toRelativeTime = (timestamp: number) => {
  return moment(timestamp).startOf('milliseconds').fromNow();
};

export const toParsedDateTime = (timestamp: string | number) => {
  return moment(timestamp).format('YYYY-MM-DD hh:mm:ss');
};

export const toParsedDate = (timestamp: string | number) => {
  return moment(timestamp).format('MMM D, YYYY');
};
