import Skeleton, { SkeletonProps } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonLoader = (props: SkeletonProps) => {
  return (
    <Skeleton
      borderRadius="2rem"
      style={{ lineHeight: 'inherit' }}
      containerClassName="skeleton-wrapper"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};

export default SkeletonLoader;
