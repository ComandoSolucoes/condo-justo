import { useState } from 'react';
import Login from './components/Login.jsx';
import DashboardSindico from './components/DashboardSindico.jsx';
import DashboardMorador from './components/DashboardMorador.jsx';
import DashboardFornecedor from './components/DashboardFornecedor.jsx';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.user_type === 'Síndico') {
    return <DashboardSindico user={user} onLogout={handleLogout} />;
  }

  if (user.user_type === 'Morador') {
    return <DashboardMorador user={user} onLogout={handleLogout} />;
  }

  if (user.user_type === 'Fornecedor') {
    return <DashboardFornecedor user={user} onLogout={handleLogout} />;
  }

  return <div>Tipo de usuário desconhecido</div>;
}

export default App;

