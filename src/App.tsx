import { createElement, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PolymeshProvider } from 'context/PolymeshContext';
import { AppThemeProvider } from 'context/ThemeContext';
import { ROUTES } from '~/constants/routes';
import SharedLayout from '~/layouts/SharedLayout';

const App = () => {
  return (
    <SharedLayout>
      <Routes>
        {ROUTES.map(({ path, component }) => (
          <Route path={path} element={createElement(component)} key={path} />
        ))}
      </Routes>
    </SharedLayout>
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
