import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AuthProvider from './components/AuthProvider/AuthProvider';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import LoginPage from './components/LoginPage/LoginPage';
import Main from './components/Main/Main';
import RequireAuth from './components/RequireAuth/RequireAuth';
import Settings from './components/Settings/Settings';
import ToastContainer from './components/ToastContainer/ToastContainer';

const AuthenticatedSettings: React.FC = () => (
  <RequireAuth>
    <Settings />
  </RequireAuth>
);

const AuthenticatedMain: React.FC = () => (
  <RequireAuth>
    <Main />
  </RequireAuth>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const Application: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter basename={process.env.PUBLIC_URL}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<AuthenticatedMain />} />
              <Route path="settings" element={<AuthenticatedSettings />} />
              <Route path="settings/:tab" element={<AuthenticatedSettings />} />
            </Routes>
          </BrowserRouter>
          <ToastContainer />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default Application;
