import { Navigate } from 'react-router-dom';
import { PATHS } from '~/constants/routes';

const Landing = () => {
  return <Navigate to={PATHS.OVERVIEW} replace />;
};

export default Landing;
