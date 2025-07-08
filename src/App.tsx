import { createElement, lazy, Suspense, useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ApolloProvider } from '@apollo/client';
import { ToastContainer } from 'react-toastify';
import { SkeletonTheme } from 'react-loading-skeleton';
import { PolymeshProvider, PolymeshContext } from '~/context/PolymeshContext';
import { TransactionStatusProvider } from '~/context/TransactionStatusContext';
import { AccountProvider } from '~/context/AccountContext';
import { PortfolioProvider } from '~/context/PortfolioContext';
import { AuthorizationsProvider } from '~/context/AuthorizationsContext';
import { ClaimsProvider } from '~/context/ClaimsContext';
import { InstructionsProvider } from '~/context/InstructionsContext';
import { DistributionsProvider } from '~/context/DistributionsContext';
import { MultiSigProvider } from '~/context/MultiSigContext';
import { AuthProvider } from '~/context/AuthContext';
import { AppThemeProvider, ThemeContext } from '~/context/ThemeContext';
import { ROUTES } from '~/constants/routes';
import { theme, GlobalStyle } from '~/styles/theme';
import { LoadingFallback } from '~/components';
import { StakingProvider } from './context/StakingContext';
import { AssetProvider } from '~/context/AssetContext';

const SharedLayout = lazy(() => import('~/layouts/SharedLayout'));

const App = () => {
  const { currentTheme } = useContext(ThemeContext);
  const {
    api: { gqlClient },
  } = useContext(PolymeshContext);

  const appComponentTree = (
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
          containerId="globalToast"
          position="top-center"
          theme={currentTheme}
        />
      </SkeletonTheme>
    </ThemeProvider>
  );

  return gqlClient ? (
    <ApolloProvider client={gqlClient}>{appComponentTree}</ApolloProvider>
  ) : (
    appComponentTree
  );
};

const WrappedApp = () => {
  return (
    <PolymeshProvider>
      <TransactionStatusProvider>
        <AccountProvider>
          <PortfolioProvider>
            <AuthorizationsProvider>
              <AuthProvider>
                <InstructionsProvider>
                  <MultiSigProvider>
                    <ClaimsProvider>
                      <DistributionsProvider>
                        <StakingProvider>
                          <AssetProvider>
                            <AppThemeProvider>
                              <BrowserRouter>
                                <App />
                              </BrowserRouter>
                            </AppThemeProvider>
                          </AssetProvider>
                        </StakingProvider>
                      </DistributionsProvider>
                    </ClaimsProvider>
                  </MultiSigProvider>
                </InstructionsProvider>
              </AuthProvider>
            </AuthorizationsProvider>
          </PortfolioProvider>
        </AccountProvider>
      </TransactionStatusProvider>
    </PolymeshProvider>
  );
};

export default WrappedApp;
