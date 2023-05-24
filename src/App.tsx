import { createElement, lazy, Suspense, useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ApolloProvider } from '@apollo/client';
import { ToastContainer } from 'react-toastify';
import { SkeletonTheme } from 'react-loading-skeleton';
import { PolymeshProvider, PolymeshContext } from '~/context/PolymeshContext';
import { AccountProvider } from '~/context/AccountContext';
import { PortfolioProvider } from '~/context/PortfolioContext';
import { AuthorizationsProvider } from '~/context/AuthorizationsContext';
import { ClaimsProvider } from '~/context/ClaimsContext';
import { InstructionsProvider } from '~/context/InstructionsContext';
import { AppThemeProvider, ThemeContext } from '~/context/ThemeContext';
import { ROUTES } from '~/constants/routes';
import { theme, GlobalStyle } from '~/styles/theme';
import { LoadingFallback } from '~/components';

const SharedLayout = lazy(() => import('~/layouts/SharedLayout'));

const App = () => {
  const { currentTheme } = useContext(ThemeContext);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <SkeletonTheme
        baseColor={theme[currentTheme].colors.skeletonBase}
        highlightColor={theme[currentTheme].colors.skeletonHighlight}
      >
        <Suspense fallback={<LoadingFallback main />}>
          <GlobalStyle />
          <SharedLayout>
            <Routes>
              {ROUTES.map(({ path, component }) => (
                <Route
                  path={path}
                  element={createElement(component)}
                  key={path}
                />
              ))}
            </Routes>
          </SharedLayout>
        </Suspense>
        <ToastContainer
          enableMultiContainer
          containerId="globalToast"
          position="top-center"
          theme={currentTheme}
        />
      </SkeletonTheme>
    </ThemeProvider>
  );
};

const WrappedApp = () => {
  const {
    settings: { gqlClient },
  } = useContext(PolymeshContext);
  if (!gqlClient)
    return (
      <PolymeshProvider>
        <AccountProvider>
          <PortfolioProvider>
            <AuthorizationsProvider>
              <InstructionsProvider>
                <ClaimsProvider>
                  <BrowserRouter>
                    <App />
                  </BrowserRouter>
                </ClaimsProvider>
              </InstructionsProvider>
            </AuthorizationsProvider>
          </PortfolioProvider>
        </AccountProvider>
      </PolymeshProvider>
    );
  return (
    <PolymeshProvider>
      <AccountProvider>
        <PortfolioProvider>
          <AuthorizationsProvider>
            <InstructionsProvider>
              <ClaimsProvider>
                <AppThemeProvider>
                  <ApolloProvider client={gqlClient}>
                    <BrowserRouter>
                      <App />
                    </BrowserRouter>
                  </ApolloProvider>
                </AppThemeProvider>
              </ClaimsProvider>
            </InstructionsProvider>
          </AuthorizationsProvider>
        </PortfolioProvider>
      </AccountProvider>
    </PolymeshProvider>
  );
};

export default WrappedApp;
