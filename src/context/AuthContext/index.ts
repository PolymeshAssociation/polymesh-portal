import { useContext } from 'react';
import AuthContext from './context';

export { default as AuthProvider } from './provider';

export const useAuthContext = () => useContext(AuthContext);
