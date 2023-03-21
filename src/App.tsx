import { createElement, Suspense, useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { PolymeshProvider } from '~/context/PolymeshContext';
import { AppThemeProvider, ThemeContext } from '~/context/ThemeContext';
import { ROUTES } from '~/constants/routes';
import SharedLayout from '~/layouts/SharedLayout';
import theme from '~/styles/theme';

export const gqlClient = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_ENDPIONT,
  cache: new InMemoryCache(),
});

const App = () => {
  const { currentTheme } = useContext(ThemeContext);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <SharedLayout>
        <Routes>
          {ROUTES.map(({ path, component }) => (
            <Route path={path} element={createElement(component)} key={path} />
          ))}
        </Routes>
      </SharedLayout>
    </ThemeProvider>
  );
};

const WrappedApp = () => {
  return (
    <PolymeshProvider>
      <AppThemeProvider>
        <ApolloProvider client={gqlClient}>
          <Suspense fallback="loading...">
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </Suspense>
        </ApolloProvider>
      </AppThemeProvider>
    </PolymeshProvider>
  );
};

export default WrappedApp;
