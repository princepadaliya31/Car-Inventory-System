import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AppRoutes } from './routes/AppRoutes';

// Create TanStack Query Client for REST caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <AppRoutes />
            </main>
            <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4">
                &copy; {new Date().getFullYear()} Velocity Motors. All rights reserved. developed for inventory logs.
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
