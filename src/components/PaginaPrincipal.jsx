import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

export default function PaginaPrincipal() {
  const [user] = useAuthState(auth);

  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Bienvenido a CIMBRA-SYS
      </h1>
      {user && (
        <p className="text-xl text-gray-600">
          Sesión iniciada como: <strong>{user.displayName || user.email}</strong>
        </p>
      )}
      <p className="text-lg text-gray-500 mt-2">
        Utiliza la barra de navegación para gestionar el inventario, clientes y contratos.
      </p>
    </div>
  );
}