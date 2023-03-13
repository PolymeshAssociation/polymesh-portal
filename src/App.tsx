import { createElement, Suspense, useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { PolymeshProvider } from '~/context/PolymeshContext';
import { AppThemeProvider, ThemeContext } from '~/context/ThemeContext';
import { ROUTES } from '~/constants/routes';
import SharedLayout from '~/layouts/SharedLayout';
import theme from '~/styles/theme';

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
        <Suspense fallback="loading...">
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Suspense>
      </AppThemeProvider>
    </PolymeshProvider>
  );
};

export default WrappedApp;
