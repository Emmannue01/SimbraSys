import React, { useState, useEffect } from 'react';
import * as feather from 'feather-icons';

// Lógica de inicialización con datos de muestra
const initialClients = [
    {
        id: 'CLI-1001',
        clientName: 'Constructora Obrera SA de CV',
        clientPhone: '5551234567',
        clientAddress: 'Av. Revolución 123, CDMX',
        projectName: 'Torres Reforma',
        registrationDate: '01/01/2023'
    },
    {
        id: 'CLI-1002',
        clientName: 'Ing. Roberto Martínez',
        clientPhone: '5559876543',
        clientAddress: 'Calle Pino 45, Naucalpan',
        projectName: 'Casa Habitación Lomas',
        registrationDate: '15/03/2023'
    }
];

// --- Componente de Alerta (Integrado para simplificar la sintaxis)
const Alert = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const iconName = type === 'success' ? 'check-circle' : 'alert-circle';

    return (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg text-white ${bgColor} transition-opacity duration-300`}>
            <div className="flex items-center gap-2">
                <i data-feather={iconName}></i>
                <span>{message}</span>
            </div>
        </div>
    );
};

// --- Componente Principal ClientsView (Contenido de la interfaz)
const ClientsView = () => {
    // Hooks de Estado
    const [clients, setClients] = useState(initialClients);
    const [formData, setFormData] = useState({
        clientName: '',
        clientPhone: '',
        clientAddress: '',
        projectName: '',
    });
    const [currentEditClientId, setCurrentEditClientId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [alert, setAlert] = useState(null);

    // Ejecuta feather.replace() después de cada renderizado que actualiza la tabla o la alerta
    useEffect(() => {
        feather.replace();
    }, [clients, alert]); 

    // Manejo del formulario
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const resetClientForm = () => {
        setFormData({
            clientName: '',
            clientPhone: '',
            clientAddress: '',
            projectName: '',
        });
        setCurrentEditClientId(null);
    };

    const showAlert = (message, type) => {
        setAlert({ message, type });
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();

        const { clientName, clientPhone, projectName } = formData;
        
        if (!clientName || !clientPhone || !projectName) {
            showAlert('Por favor complete los campos requeridos', 'error');
            return;
        }

        if (currentEditClientId) {
            // Editar cliente existente
            setClients(prevClients => prevClients.map(client => 
                client.id === currentEditClientId ? {
                    ...client,
                    ...formData,
                    registrationDate: new Date().toLocaleDateString('es-MX')
                } : client
            ));
            showAlert('Cliente actualizado correctamente', 'success');
        } else {
            // Añadir nuevo cliente
            const newClient = {
                id: 'CLI-' + Date.now(),
                ...formData,
                registrationDate: new Date().toLocaleDateString('es-MX')
            };
            setClients(prevClients => [...prevClients, newClient]);
            showAlert('Cliente registrado correctamente', 'success');
        }

        resetClientForm();
    };

    // Funciones de Acción
    const editClient = (id) => {
        const client = clients.find(c => c.id === id);
        if (!client) return;
        
        setFormData({
            clientName: client.clientName,
            clientPhone: client.clientPhone,
            clientAddress: client.clientAddress,
            projectName: client.projectName,
        });
        setCurrentEditClientId(id);
        
        document.getElementById('clientForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const deleteClient = (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
            setClients(prevClients => prevClients.filter(client => client.id !== id));
            showAlert('Cliente eliminado correctamente', 'success');
        }
    };

    // Lógica de Filtrado y Renderizado
    const filteredClients = clients.filter(client => 
        client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.clientPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.projectName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isClientListEmpty = filteredClients.length === 0;

    return (
        // Usamos un Fragmento (<>...</>) como elemento raíz
        <>
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Formulario de Cliente */}
                    <section className="w-full md:w-1/3">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <i data-feather="user-plus" className="text-blue-600"></i>
                                {currentEditClientId ? 'Editar Cliente' : 'Registrar Cliente'}
                            </h2>
                            
                            <form id="clientForm" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre Completo <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" id="clientName" required value={formData.clientName} onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                
                                <div>
                                    <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono <span className="text-red-500">*</span>
                                    </label>
                                    <input type="tel" id="clientPhone" required value={formData.clientPhone} onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                
                                <div>
                                    <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                        Dirección
                                    </label>
                                    <textarea id="clientAddress" rows="3" value={formData.clientAddress} onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                                </div>
                                
                                <div>
                                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre de Obra/Proyecto <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" id="projectName" required value={formData.projectName} onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                
                                <div className="flex gap-3 pt-4">
                                    <button type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out flex items-center justify-center gap-2">
                                        <i data-feather="save"></i>
                                        {currentEditClientId ? 'Actualizar' : 'Guardar'}
                                    </button>
                                    <button type="button" onClick={resetClientForm}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out flex items-center justify-center gap-2">
                                        <i data-feather="x"></i>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                    
                    {/* Tabla de Clientes */}
                    <section className="w-full md:w-2/3">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <i data-feather="users" className="text-blue-600"></i>
                                    Lista de Clientes
                                </h2>
                                <div className="relative">
                                    <input type="text" id="clientSearch" placeholder="Buscar cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                    <i data-feather="search" className="absolute left-3 top-2.5 text-gray-400"></i>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table id="clientsTable" className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Nombre
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Teléfono
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Obra/Proyecto
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredClients.map(client => (
                                        <tr key={client.id} className="animate-fadeIn">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{client.clientName}</div>
                                                <div className="text-sm text-gray-500">{client.clientAddress || 'Sin dirección'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {client.clientPhone}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {client.projectName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => editClient(client.id)} className="text-blue-600 hover:text-blue-900 mr-3">
                                                    <i data-feather="edit"></i>
                                                </button>
                                                <button onClick={() => deleteClient(client.id)} className="text-red-600 hover:text-red-900">
                                                    <i data-feather="trash-2"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Estado Vacío */}
                        {isClientListEmpty && (
                            <div id="clientsEmptyState" className="text-center py-12">
                                <i data-feather="users" className="mx-auto h-12 w-12 text-gray-400"></i>
                                <h3 className="mt-2 text-lg font-medium text-gray-900">No hay clientes registrados</h3>
                                <p className="mt-1 text-sm text-gray-500">Empieza agregando nuevos clientes al sistema.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
            </main>

            {/* Componente de Alerta renderizado al final del Fragmento */}
            {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </>
    );
};

export default ClientsView;