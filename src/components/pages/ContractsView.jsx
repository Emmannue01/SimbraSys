import React, { useState, useEffect, useCallback, useMemo } from 'react';
import feather from 'feather-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// --- Datos Fijos ---ssssdadasdadas
//asdahdjasdahdkaskd
const initialMaterials = [
    { id: 'tabla', name: 'Tabla de cimbra', defaultPrice: 17, selected: false, quantity: 1, currentPrice: 17 },
    { id: 'barrote', name: 'Barrote completo', defaultPrice: 17, selected: false, quantity: 1, currentPrice: 17 },
    { id: 'pedazo', name: 'Pedazo de barrote', defaultPrice: 17, selected: false, quantity: 1, currentPrice: 17 },
];

const clientsData = {
    'CLI-1001': { name: 'Constructora Obrera SA de CV', phone: '5551234567', project: 'Torres Reforma' },
    'CLI-1002': { name: 'Ing. Roberto Martínez', phone: '5559876543', project: 'Casa Habitación Lomas' }
};

const RENT_DAYS = 20;

// --- Componente de Alerta (Reutilizado de ClientsView) ---
const Alert = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(), 3000);
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

// --- Componente Principal ---
const ContractsView = () => {
    const today = new Date();
    
    // Generación inicial de datos para preview
    const initialContractNumber = `CIM-${today.getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const initialReturnDate = new Date(today.getTime());
    initialReturnDate.setDate(today.getDate() + RENT_DAYS);

    // --- Hooks de Estado ---
    const [materials, setMaterials] = useState(initialMaterials);
    const [selectedClient, setSelectedClient] = useState('');
    const [startDate, setStartDate] = useState(format(today, 'yyyy-MM-dd'));
    const [contractNumber] = useState(initialContractNumber);
    const [alert, setAlert] = useState(null);

    // Manejo de la fecha de devolución
    const returnDate = useMemo(() => {
        if (!startDate) return null;
        const start = new Date(startDate + 'T00:00:00'); // Asegurar UTC para evitar desfases
        const ret = new Date(start.getTime());
        ret.setDate(start.getDate() + RENT_DAYS);
        return ret;
    }, [startDate]);

    // Cálculo de Costo Total (useMemo previene recálculos innecesarios)
    const totalCost = useMemo(() => {
        return materials
            .filter(m => m.selected)
            .reduce((sum, m) => sum + (m.quantity * m.currentPrice), 0);
    }, [materials]);

    // Función para mostrar alertas
    const showAlert = useCallback((message, type) => {
        setAlert({ message, type });
    }, []);

    // Lógica para feather icons
    useEffect(() => {
        feather.replace();
    }, [materials, selectedClient, alert]);

    // --- Handlers de Interacción ---

    const handleClientChange = (e) => {
        setSelectedClient(e.target.value);
    };

    const handleMaterialCheck = (e, id) => {
        const checked = e.target.checked;
        setMaterials(prev => prev.map(m => 
            m.id === id ? { ...m, selected: checked } : m
        ));
    };

    const handleQuantityChange = (e, id) => {
        const quantity = parseInt(e.target.value) || 1;
        setMaterials(prev => prev.map(m => 
            m.id === id ? { ...m, quantity: quantity } : m
        ));
    };

    const handlePriceChange = (e, id) => {
        const price = parseFloat(e.target.value) || initialMaterials.find(m => m.id === id).defaultPrice;
        setMaterials(prev => prev.map(m => 
            m.id === id ? { ...m, currentPrice: price } : m
        ));
    };

    const resetForm = () => {
        setSelectedClient('');
        setStartDate(format(today, 'yyyy-MM-dd'));
        setMaterials(initialMaterials);
        showAlert('Formulario limpiado', 'info');
    };

    const generateContract = (e) => {
        e.preventDefault();
        
        if (!selectedClient) {
            showAlert('Por favor seleccione un cliente', 'error');
            return;
        }
        if (materials.filter(m => m.selected).length === 0) {
            showAlert('Por favor seleccione al menos un material', 'error');
            return;
        }

        showAlert('Contrato generado exitosamente', 'success');
        // Aquí iría la lógica para enviar datos al servidor.
    };
    
    // --- Renderizado de Vista Previa ---
    const clientInfo = clientsData[selectedClient] || {};

    const selectedMaterials = materials.filter(m => m.selected);
    const previewMaterialsContent = selectedMaterials.length > 0 ? (
        selectedMaterials.map(m => (
            <tr key={m.id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{m.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{m.quantity}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{m.currentPrice.toFixed(2)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{(m.quantity * m.currentPrice).toFixed(2)}</td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="4" className="px-4 py-4 text-center text-gray-500">No hay materiales seleccionados</td>
        </tr>
    );

    // --- JSX Principal ---
    return (
        <div className="bg-gray-50">
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Formulario de Contrato */}
                    <section className="w-full lg:w-1/2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <i data-feather="file-text" className="text-blue-600"></i>
                                Nuevo Contrato
                            </h2>
                            
                            <form id="contractForm" onSubmit={generateContract} className="space-y-4">
                                {/* Selección de Cliente */}
                                <div>
                                    <label htmlFor="clientSelect" className="block text-sm font-medium text-gray-700 mb-1">
                                        Cliente <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select id="clientSelect" required value={selectedClient} onChange={handleClientChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                            <option value="" disabled>Seleccione un cliente</option>
                                            {Object.keys(clientsData).map(key => (
                                                <option key={key} value={key}>{clientsData[key].name}</option>
                                            ))}
                                        </select>
                                        <i data-feather="chevron-down" className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"></i>
                                    </div>
                                </div>
                                
                                {/* Fechas del Contrato */}
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha Inicio <span className="text-red-500">*</span>
                                    </label>
                                    <input type="date" id="startDate" required value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha Devolución
                                    </label>
                                    <div className="bg-gray-100 px-3 py-2 rounded-md">
                                        <span id="returnDateDisplay">{returnDate ? format(returnDate, 'dd/MM/yyyy') : '-'}</span>
                                        <span className="text-sm text-gray-500 ml-2">(20 días de renta)</span>
                                    </div>
                                </div>
                                
                                {/* Selección de Materiales */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Materiales Disponibles <span className="text-red-500">*</span>
                                    </label>
                                    <div className="border border-gray-300 rounded-md overflow-hidden">
                                        <div className="max-h-60 overflow-y-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Sel.
                                                        </th>
                                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Material
                                                        </th>
                                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Cant.
                                                        </th>
                                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Precio/20 días
                                                            <span className="text-xs font-normal">(editable)</span>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody id="materialsTable" className="bg-white divide-y divide-gray-200">
                                                    {materials.map((m) => (
                                                        <tr key={m.id}>
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                <input type="checkbox" checked={m.selected} onChange={(e) => handleMaterialCheck(e, m.id)}
                                                                    className="material-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                {m.name}
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                <input type="number" min="1" value={m.quantity} onChange={(e) => handleQuantityChange(e, m.id)}
                                                                    className="material-quantity w-20 px-2 py-1 border border-gray-300 rounded-md text-sm" />
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-gray-500">$</span>
                                                                    <input type="number" min="1" value={m.currentPrice} onChange={(e) => handlePriceChange(e, m.id)}
                                                                        className="piece-price w-20 px-2 py-1 border border-gray-300 rounded-md text-sm" />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Costo Estimado */}
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">Costo Estimado:</span>
                                        <span id="estimatedCost" className="text-2xl font-bold text-blue-600">${totalCost.toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                {/* Botones */}
                                <div className="flex gap-3 pt-4">
                                    <button type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out flex items-center justify-center gap-2">
                                        <i data-feather="file-text"></i>
                                        Generar Contrato
                                    </button>
                                    <button type="button" onClick={resetForm}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out flex items-center justify-center gap-2">
                                        <i data-feather="x"></i>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                    
                    {/* Vista Previa del Contrato */}
                    <section className="w-full lg:w-1/2">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky lg:top-4">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <i data-feather="eye" className="text-blue-600"></i>
                                    Vista Previa
                                </h2>
                                <div className="flex gap-2">
                                    <button onClick={() => showAlert('Simulación: Contrato enviado a impresión', 'info')} className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
                                        <i data-feather="printer"></i>
                                    </button>
                                    <button onClick={() => showAlert('Simulación: Contrato descargado como PDF', 'info')} className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
                                        <i data-feather="download"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div id="contractPreview" className="border border-gray-200 rounded-md p-6 space-y-6">
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-800">CONTRATO DE RENTA</h3>
                                    <p className="text-sm text-gray-500">CIMBRA-SYS S.A. DE C.V.</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">No. Contrato:</p>
                                        <p className="font-medium" id="previewContractNumber">{contractNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Fecha:</p>
                                        <p className="font-medium" id="previewContractDate">{format(today, 'dd/MM/yyyy')}</p>
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="font-bold text-gray-700 mb-2">DATOS DEL CLIENTE</h4>
                                    <div className="space-y-1">
                                        <p id="previewClientName">{clientInfo.name || '-'}</p>
                                        <p id="previewClientPhone">{clientInfo.phone ? `Tel: ${clientInfo.phone}` : '-'}</p>
                                        <p id="previewProjectName">{clientInfo.project ? `Proyecto: ${clientInfo.project}` : '-'}</p>
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="font-bold text-gray-700 mb-2">DETALLES DE RENTA</h4>
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <div>
                                            <p className="text-sm text-gray-500">Fecha Inicio:</p>
                                            <p className="font-medium" id="previewStartDate">{format(new Date(startDate), 'dd/MM/yyyy')}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Fecha Devolución:</p>
                                            <p className="font-medium" id="previewReturnDate">{returnDate ? format(returnDate, 'dd/MM/yyyy') : '-'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Material
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Cantidad
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Precio/20 días
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Subtotal
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody id="previewMaterials" className="bg-white divide-y divide-gray-200">
                                                {previewMaterialsContent}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-700">TOTAL:</span>
                                        <span id="previewTotalCost" className="text-xl font-bold text-blue-600">${totalCost.toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4 text-sm text-gray-500">
                                    <p className="mb-2">Condiciones:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>El cliente se compromete a devolver los materiales en buen estado</li>
                                        <li>Daños o pérdidas serán cobrados al precio de reposición</li>
                                        <li>Retrasos en devolución generarán cargos adicionales</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </div>
    );
};

export default ContractsView;