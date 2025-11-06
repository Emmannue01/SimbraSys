import React, { useState } from 'react';
import { RotateCw, Search, Package, CheckCircle, Clock } from 'lucide-react';

const Returns = () => {
  const [searchInput, setSearchInput] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showContractResults, setShowContractResults] = useState(false);
  const [showMaterialsSection, setShowMaterialsSection] = useState(false);
  const [materials, setMaterials] = useState([]);

  const contractData = {
    id: 'CIM-2023-042',
    clientName: 'Constructora Obrera',
    projectName: 'Torres Reforma',
    startDate: '15/05/2023',
    returnDate: '04/06/2023',
    status: 'Pendiente'
  };

  const returnsHistory = [
    {
      date: '10/05/2023',
      contractId: 'CIM-2023-035',
      client: 'Ing. Roberto Martínez',
      materials: '25 tablas, 10 barrotes',
      status: 'Completado'
    }
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.length > 0) {
      setShowContractResults(true);
    } else {
      setShowContractResults(false);
    }
  };

  const handleContractClick = () => {
    setShowMaterialsSection(true);
    // Aquí cargarías los materiales del contrato seleccionado
  };

  const handleRegisterReturn = () => {
    alert('Devolución registrada exitosamente');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar component would go here */}
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <RotateCw className="text-blue-600" />
          Módulo de Devoluciones
        </h1>

        <div className="space-y-8">
          {/* Buscar Contrato/Cliente */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Search className="text-blue-600" />
              Buscar Contrato o Cliente
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    id="searchInput"
                    value={searchInput}
                    onChange={handleSearch}
                    placeholder="Buscar por ID de contrato, nombre de cliente o proyecto..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
              </div>
              <div>
                <select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente de devolución</option>
                  <option value="completo">Devuelto parcialmente</option>
                </select>
              </div>
            </div>

            {showContractResults && (
              <div id="contractResults" className="mt-4 space-y-2">
                <div
                  onClick={handleContractClick}
                  className="p-4 border border-gray-200 rounded-md hover:bg-blue-50 cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">
                        Contrato: <span className="contract-id">{contractData.id}</span>
                      </h3>
                      <p className="text-sm text-gray-600">
                        Cliente: <span className="client-name">{contractData.clientName}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Proyecto: <span className="project-name">{contractData.projectName}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        Fecha inicio: <span className="start-date">{contractData.startDate}</span>
                      </p>
                      <p className="text-sm">
                        Fecha devolución: <span className="return-date">{contractData.returnDate}</span>
                      </p>
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        {contractData.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Materiales a Devolver */}
          {showMaterialsSection && (
            <section id="materialsSection" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="text-blue-600" />
                Materiales a Devolver
              </h2>
              
              <div className="overflow-x-auto">
                <table id="materialsTable" className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Material
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad Rentada
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad a Devolver
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody id="materialsBody" className="bg-white divide-y divide-gray-200">
                    {materials.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                          No hay materiales para mostrar
                        </td>
                      </tr>
                    ) : (
                      materials.map((material, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {material.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {material.rented}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {material.toReturn}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {material.status}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  id="registerReturnBtn"
                  onClick={handleRegisterReturn}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium transition duration-150 ease-in-out flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Registrar Devolución
                </button>
              </div>
            </section>
          )}

          {/* Historial de Devoluciones */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="text-blue-600" />
              Historial de Devoluciones Recientes
            </h2>
            
            <div className="overflow-x-auto">
              <table id="returnsHistoryTable" className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contrato
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Materiales Devueltos
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody id="returnsHistoryBody" className="bg-white divide-y divide-gray-200">
                  {returnsHistory.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.contractId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.client}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.materials}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* Footer component would go here */}
    </div>
  );
};

export default Returns;