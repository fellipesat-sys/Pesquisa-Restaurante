import { useState, useEffect } from 'react';
import { SurveyForm } from './components/SurveyForm';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

function App() {
  const [view, setView] = useState<'survey' | 'admin-login' | 'admin-dashboard'>('survey');

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      if (path === '/admin' || hash === '#admin' || hash === '#/admin') {
        const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
        setView(isLoggedIn ? 'admin-dashboard' : 'admin-login');
      } else {
        setView('survey');
      }
    };

    // Executa na inicialização e escuta eventos de mudança de rota
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleBackToSurvey = () => {
    window.location.hash = '';
    // Altera o caminho sem forçar recarregamento da página
    if (window.location.pathname === '/admin') {
      window.history.pushState({}, '', '/');
    }
    setView('survey');
  };

  const handleLoginSuccess = () => {
    sessionStorage.setItem('admin_logged_in', 'true');
    setView('admin-dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    window.location.hash = '';
    if (window.location.pathname === '/admin') {
      window.history.pushState({}, '', '/');
    }
    setView('survey');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300">
      {view === 'survey' && (
        <SurveyForm />
      )}
      {view === 'admin-login' && (
        <AdminLogin 
          onLoginSuccess={handleLoginSuccess} 
          onBackToSurvey={handleBackToSurvey} 
        />
      )}
      {view === 'admin-dashboard' && (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
