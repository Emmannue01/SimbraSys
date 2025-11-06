import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './components/firebase';

import LoginForm from './components/Login';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPasswordForm'; 
import PaginaPrincipal from './components/PaginaPrincipal';
import ContractsPage from './components/pages/ContractsPage';
import Devoluciones from './components/pages/Devoluciones';
import ReportsIncome from './components/pages/reportes';
import ClientesPage from './components/pages/ClientesPage';
import Layout from './Layout';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Cargando...</div>
//sss
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/registro" element={user ? <Navigate to="/pagina-principal" /> : <RegisterForm />} />
        <Route path="/recuperar-contrasena" element={user ? <Navigate to="/pagina-principal" /> : <ForgotPasswordForm />} />

        {/* Rutas protegidas con el Layout */}
        <Route element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/pagina-principal" element={<PaginaPrincipal />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/contratos" element={<ContractsPage />} />
          <Route path="/devoluciones" element={<Devoluciones />} />
          <Route path="/reportes" element={<ReportsIncome />} />
        </Route>

        <Route path="*" element={<Navigate to={user ? "/pagina-principal" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
