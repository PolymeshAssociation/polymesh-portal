import moment from 'moment';

export const toRelativeTime = (timestamp: number) => {
  return moment(timestamp).startOf().fromNow();
};
