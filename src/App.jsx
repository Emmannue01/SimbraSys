import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './components/firebase';

import LoginForm from './components/Login';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPasswordForm'; 
import PaginaPrincipal from './components/PaginaPrincipal';
import ContractsPage from './components/pages/ContractsPage';
import InventarioPage from './components/pages/InventarioPage';
import Devoluciones from './components/pages/Devoluciones';
import ReportsIncome from './components/pages/reportes';
import ClientesPage from './components/pages/ClientesPage';
import Layout from './Layout';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Cargando...</div>
//sss
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginForm />} />
        <Route path="/registro" element={user ? <Navigate to="/dashboard" /> : <RegisterForm />} />
        <Route path="/recuperar-contrasena" element={user ? <Navigate to="/dashboard" /> : <ForgotPasswordForm />} />

        {/* Rutas protegidas con el Layout */}
        <Route element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<PaginaPrincipal />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/contratos" element={<ContractsPage />} />
          <Route path="/devoluciones" element={<Devoluciones />} />
          <Route path="/reportes" element={<ReportsIncome />} />
        </Route>

        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
