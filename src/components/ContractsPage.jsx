// src/components/ContractsPage.jsx

import React from 'react';
import { auth } from './firebase.jsx'; // Usa la ruta corregida
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
// Importamos la vista principal de Contratoss
//ssdfsdfs
import ContractsView from './pages/ContractsView.jsx'; 

export default function ContractsPage() {
    const navigate = useNavigate();
    const user = auth.currentUser; 

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* CABECERA (Contiene el Logout) */}
            <header className="p-8 bg-white shadow-md">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800">Sección de Contratos</h1>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <p className="text-gray-600">
                                ¡Hola, <strong>{user.displayName || user.email}</strong>!
                            </p>
                        ) : (
                            <p className="text-gray-600">Cargando usuario...</p>
                        )}
                        
                        <button 
                            onClick={handleLogout} 
                            className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition duration-150"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* CONTENIDO DE LA INTERFAZ CONVERTIDA */}
            <ContractsView /> 
        </div>
    );
}