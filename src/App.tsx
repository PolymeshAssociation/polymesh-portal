import { ApolloProvider } from '@apollo/client';
import { createElement, lazy, Suspense, useContext } from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from 'styled-components';
import { LoadingFallback } from '~/components';
import { ROUTES } from '~/constants/routes';
import { AccountProvider } from '~/context/AccountContext';
import { AssetProvider } from '~/context/AssetContext';
import { AuthProvider } from '~/context/AuthContext';
import { AuthorizationsProvider } from '~/context/AuthorizationsContext';
import { ClaimsProvider } from '~/context/ClaimsContext';
import { DistributionsProvider } from '~/context/DistributionsContext';
import { InstructionsProvider } from '~/context/InstructionsContext';
import { MultiSigProvider } from '~/context/MultiSigContext';
import { PolymeshContext, PolymeshProvider } from '~/context/PolymeshContext';
import { PortfolioProvider } from '~/context/PortfolioContext';
import { AppThemeProvider, ThemeContext } from '~/context/ThemeContext';
import { TransactionStatusProvider } from '~/context/TransactionStatusContext';
import { GlobalStyle, theme } from '~/styles/theme';
import { StakingProvider } from './context/StakingContext';

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
      <AccountProvider>
        <TransactionStatusProvider>
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
        </TransactionStatusProvider>
      </AccountProvider>
    </PolymeshProvider>
  );
};

export default WrappedApp;
