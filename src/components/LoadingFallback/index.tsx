import { SkeletonLoader } from '../UiKit';
import { StyledWrapper } from './styles';

interface IFallbackProps {
  main?: boolean;
}

const LoadingFallback: React.FC<IFallbackProps> = ({ main }) => {
  return (
    <StyledWrapper main={main}>
      <SkeletonLoader
        circle
        width={36}
        height={36}
        count={3}
        containerClassName="skeleton"
      />
    </StyledWrapper>
  );
};

export default LoadingFallback;
