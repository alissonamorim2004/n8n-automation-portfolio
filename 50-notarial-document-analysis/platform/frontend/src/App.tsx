import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/toast';
import LoginPage from './pages/LoginPage';
import AnalysisPage from './pages/AnalysisPage';
import AnalysisTypesPage from './pages/AnalysisTypesPage';
import UsersPage from './pages/UsersPage';
import TokenUsagePage from './pages/TokenUsagePage';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

type PageType = 'analysis' | 'analysis-types' | 'users' | 'token-usage';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('analysis');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginPage />;
  }

  const handleNavigate = (page: PageType) => {
    const allowedPages = profile?.role === 'admin'
      ? ['analysis', 'token-usage', 'analysis-types', 'users']
      : ['analysis'];

    if (!allowedPages.includes(page)) {
      return;
    }
    setCurrentPage(page);
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {currentPage === 'token-usage' && profile.role === 'admin' && <TokenUsagePage />}
      {currentPage === 'analysis' && <AnalysisPage />}
      {currentPage === 'analysis-types' && profile.role === 'admin' && <AnalysisTypesPage />}
      {currentPage === 'users' && profile.role === 'admin' && <UsersPage />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
