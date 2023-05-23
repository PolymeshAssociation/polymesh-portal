import { createElement, Suspense, useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ApolloProvider } from '@apollo/client';
import { ToastContainer } from 'react-toastify';
import { PolymeshProvider } from '~/context/PolymeshContext';
import { AccountProvider } from '~/context/AccountContext';
import { PortfolioProvider } from '~/context/PortfolioContext';
import { AuthorizationsProvider } from '~/context/AuthorizationsContext';
import { ClaimsProvider } from './context/ClaimsContext';
import { InstructionsProvider } from '~/context/InstructionsContext';
import { DistributionsProvider } from '~/context/DistributionsContext';
import { AppThemeProvider, ThemeContext } from '~/context/ThemeContext';
import { ROUTES } from '~/constants/routes';
import { gqlClient } from '~/config/graphql';
import SharedLayout from '~/layouts/SharedLayout';
import { theme, GlobalStyle } from '~/styles/theme';

const App = () => {
  const { currentTheme } = useContext(ThemeContext);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <GlobalStyle />
      <SharedLayout>
        <Routes>
          {ROUTES.map(({ path, component }) => (
            <Route path={path} element={createElement(component)} key={path} />
          ))}
        </Routes>
      </SharedLayout>
      <ToastContainer
        enableMultiContainer
        containerId="globalToast"
        position="top-center"
        theme={currentTheme}
      />
    </ThemeProvider>
  );
};

const WrappedApp = () => {
  return (
    <PolymeshProvider>
      <AccountProvider>
        <PortfolioProvider>
          <AuthorizationsProvider>
            <InstructionsProvider>
              <ClaimsProvider>
                <DistributionsProvider>
                  <AppThemeProvider>
                    <ApolloProvider client={gqlClient}>
                      <Suspense fallback="loading...">
                        <BrowserRouter>
                          <App />
                        </BrowserRouter>
                      </Suspense>
                    </ApolloProvider>
                  </AppThemeProvider>
                </DistributionsProvider>
              </ClaimsProvider>
            </InstructionsProvider>
          </AuthorizationsProvider>
        </PortfolioProvider>
      </AccountProvider>
    </PolymeshProvider>
  );
};

export default WrappedApp;
