import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './components/firebase';

import LoginForm from './components/Login';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ClientesPage from './components/ClientesPage';
import PaginaPrincipal from './components/PaginaPrincipal';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Cargando...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Modificación Clave:
            Si el usuario ya está logueado, no lo redirigimos desde aquí.
            La protección de rutas se encargará de sacarlo de /login si intenta acceder manualmente.
            Esto permite que Login.jsx complete su lógica de autorización antes de navegar. */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/registro" element={user ? <Navigate to="/pagina-principal" /> : <RegisterForm />} />
        <Route path="/recuperar-contrasena" element={user ? <Navigate to="/pagina-principal" /> : <ForgotPasswordForm />} />
        <Route path="/clientes" element={user ? <ClientesPage /> : <Navigate to="/login" />} />
        <Route path="/pagina-principal" element={user ? <PaginaPrincipal /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? "/pagina-principal" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
