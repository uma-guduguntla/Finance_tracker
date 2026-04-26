import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex' }}>
      <Sidebar />
      <main className="page-transition" style={{ 
        flex: 1, 
        marginLeft: '260px', 
        padding: '2rem',
        maxWidth: 'calc(100vw - 260px)',
        boxSizing: 'border-box'
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
