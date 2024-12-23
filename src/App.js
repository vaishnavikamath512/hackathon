import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div>
      {isAuthenticated ? <Dashboard /> : <Login onLogin={handleLogin} />}
    </div>
  );
};

export default App;