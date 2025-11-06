import React, { useState, useEffect } from 'react';
import { FileText, ChevronDown, Eye, Printer, Download, X } from 'lucide-react';

const ContractsRental = () => {
  const [selectedClient, setSelectedClient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [materials, setMaterials] = useState([
    { id: 1, name: 'Tabla de cimbra', checked: false, quantity: 1, price: 17, type: 'tabla' },
    { id: 2, name: 'Barrote completo', checked: false, quantity: 1, price: 17, type: 'barrote' },
    { id: 3, name: 'Pedazo de barrote', checked: false, quantity: 1, price: 17, type: 'pedazo' }
  ]);

  const clients = [
    { id: 'CLI-1001', name: 'Constructora Obrera SA de CV', phone: '744-123-4567', project: 'Proyecto Centro' },
    { id: 'CLI-1002', name: 'Ing. Roberto Martínez', phone: '744-987-6543', project: 'Obra Residencial' }
  ];

  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + 20);
      setReturnDate(start.toISOString().split('T')[0]);
    }
  }, [startDate]);

  const calculateEstimatedCost = () => {
    return materials.reduce((total, material) => {
      if (material.checked) {
        return total + (material.quantity * material.price);
      }
      return total;
    }, 0);
  };

  const handleMaterialCheck = (id) => {
    setMaterials(materials.map(m => 
      m.id === id ? { ...m, checked: !m.checked } : m
    ));
  };

  const handleQuantityChange = (id, value) => {
    setMaterials(materials.map(m => 
      m.id === id ? { ...m, quantity: Math.max(1, parseInt(value) || 1) } : m
    ));
  };

  const handlePriceChange = (id, value) => {
    setMaterials(materials.map(m => 
      m.id === id ? { ...m, price: Math.max(1, parseFloat(value) || 1) } : m
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClient || !startDate || !materials.some(m => m.checked)) {
      alert('Por favor complete todos los campos requeridos y seleccione al menos un material');
      return;
    }
    alert('Contrato generado exitosamente');
  };

  const handleCancel = () => {
    setSelectedClient('');
    setStartDate('');
    setReturnDate('');
    setMaterials(materials.map(m => ({ ...m, checked: false, quantity: 1, price: 17 })));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('Función de descarga en desarrollo');
  };

  const getSelectedClient = () => {
    return clients.find(c => c.id === selectedClient);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX');
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const estimatedCost = calculateEstimatedCost();
  const client = getSelectedClient();
  const today = new Date().toLocaleDateString('es-MX');
  const contractNumber = 'CIM-2023-001';

  return (
    <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-8 h-full">
          {/* Formulario de Contrato */}
          <section className="w-full lg:w-1/2 print:hidden">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="text-blue-600" size={24} />
                Nuevo Contrato
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Selección de Cliente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="">Seleccione un cliente</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>

                {/* Fechas del Contrato */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Devolución
                  </label>
                  <div className="bg-gray-100 px-3 py-2 rounded-md">
                    <span>{returnDate ? formatDate(returnDate) : '-'}</span>
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
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Seleccionar
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Material
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Cantidad
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Precio/20 días <span className="text-xs font-normal">(editable)</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {materials.map(material => (
                            <tr key={material.id}>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={material.checked}
                                  onChange={() => handleMaterialCheck(material.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {material.name}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <input
                                  type="number"
                                  min="1"
                                  value={material.quantity}
                                  onChange={(e) => handleQuantityChange(material.id, e.target.value)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                                />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">$</span>
                                  <input
                                    type="number"
                                    min="1"
                                    value={material.price}
                                    onChange={(e) => handlePriceChange(material.id, e.target.value)}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                                  />
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
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(estimatedCost)}</span>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out flex items-center justify-center gap-2"
                  >
                    <FileText size={18} />
                    Generar Contrato
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Vista Previa del Contrato */}
          <section className="w-full lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Eye className="text-blue-600" size={24} />
                  Vista Previa
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint} title="Imprimir"
                    className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100"
                  >
                    <Printer size={20} />
                  </button>
                  <button
                    onClick={handleDownload} title="Descargar"
                    className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100"
                  >
                    <Download size={20} />
                  </button>
                </div>
              </div>

              <div id="contract-preview" className="border border-gray-200 rounded-md p-6 space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">CONTRATO DE RENTA</h3>
                  <p className="text-sm text-gray-500">CIMBRA-SYS S.A. DE C.V.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">No. Contrato:</p>
                    <p className="font-medium">{contractNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha:</p>
                    <p className="font-medium">{today}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-bold text-gray-700 mb-2">DATOS DEL CLIENTE</h4>
                  <div className="space-y-1">
                    <p>{client ? client.name : '-'}</p>
                    <p>{client ? client.phone : '-'}</p>
                    <p>{client ? client.project : '-'}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-bold text-gray-700 mb-2">DETALLES DE RENTA</h4>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-sm text-gray-500">Fecha Inicio:</p>
                      <p className="font-medium">{formatDate(startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha Devolución:</p>
                      <p className="font-medium">{formatDate(returnDate)}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Material
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Cantidad
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Precio/20 días
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {materials.filter(m => m.checked).length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                              No hay materiales seleccionados
                            </td>
                          </tr>
                        ) : (
                          materials.filter(m => m.checked).map(material => (
                            <tr key={material.id}>
                              <td className="px-4 py-2 text-sm text-gray-900">{material.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{material.quantity}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(material.price)}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {formatCurrency(material.quantity * material.price)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">TOTAL:</span>
                    <span className="text-xl font-bold text-blue-600">{formatCurrency(estimatedCost)}</span>
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
    </div>
  );
};

export default ContractsRental;