import React from 'react';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function ClientesPage() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirige al login después de cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Bienvenido a la sección de Clientes</h1>
      {user && <p className="mt-2 text-gray-700">Has iniciado sesión como: <strong>{user.displayName || user.email}</strong></p>}
      <button onClick={handleLogout} className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Cerrar Sesión</button>
    </div>
  );
}