
import React, { useState, useEffect } from 'react';
import { Search, Package, PlusCircle, Save, X, List, Edit2, Trash2, LogOut } from 'lucide-react';

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    materialType: '',
    status: '',
    quantity: '',
    registerDate: new Date().toLocaleDateString('es-MX'),
    materialId: `CIM-${Math.floor(Math.random() * 10000)}`
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  const user = { displayName: 'Usuario Demo', email: 'demo@cimbrasys.com' };

  useEffect(() => {
    const savedInventory = localStorage.getItem('cimbrasys-inventory');
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cimbrasys-inventory', JSON.stringify(inventory));
  }, [inventory]);

  const handleLogout = () => {
    alert('Funcionalidad de cierre de sesión\nIntegrar con:\n\nimport { auth } from "./firebase.jsx";\nimport { signOut } from "firebase/auth";\n\nconst handleLogout = async () => {\n  await signOut(auth);\n  navigate("/login");\n};');
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId !== null) {
      setInventory(prev => prev.map(item => 
        item.id === editingId 
          ? { ...formData, id: editingId }
          : item
      ));
      setEditingId(null);
    } else {
      const newItem = {
        ...formData,
        id: Date.now()
      };
      setInventory(prev => [...prev, newItem]);
    }
    
    handleCancel();
  };

  const handleCancel = () => {
    setFormData({
      materialType: '',
      status: '',
      quantity: '',
      registerDate: new Date().toLocaleDateString('es-MX'),
      materialId: `CIM-${Math.floor(Math.random() * 10000)}`
    });
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setFormData({
      materialType: item.materialType,
      status: item.status,
      quantity: item.quantity,
      registerDate: item.registerDate,
      materialId: item.materialId
    });
    setEditingId(item.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este material?')) {
      setInventory(prev => prev.filter(item => item.id !== id));
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.materialType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.materialId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      'Disponible': 'bg-green-100 text-green-800',
      'Rentado': 'bg-blue-100 text-blue-800',
      'Dañado': 'bg-red-100 text-red-800',
      'Extraviado': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Package className="text-blue-600" size={32} />
              <h1 className="text-2xl font-bold text-gray-800">CimbraSys</h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Bienvenido</p>
                  <p className="font-semibold text-gray-800">
                    {user.displayName || user.email}
                  </p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                <LogOut size={18} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <section className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <PlusCircle className="text-blue-600" size={28} />
                {editingId ? 'Editar Material' : 'Registrar Material'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="materialType" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Material <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="materialType"
                    value={formData.materialType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" disabled>Seleccione un tipo</option>
                    <option value="Tabla">Tabla</option>
                    <option value="Barrote">Barrote</option>
                    <option value="Pedazo de barrote">Pedazo de barrote</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" disabled>Seleccione estado</option>
                    <option value="Disponible">Disponible</option>
                    <option value="Rentado">Rentado</option>
                    <option value="Dañado">Dañado</option>
                    <option value="Extraviado">Extraviado</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="registerDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Registro
                  </label>
                  <input
                    type="text"
                    id="registerDate"
                    value={formData.registerDate}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="materialId" className="block text-sm font-medium text-gray-700 mb-1">
                    ID de Material
                  </label>
                  <input
                    type="text"
                    id="materialId"
                    value={formData.materialId}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.materialType || !formData.status || !formData.quantity}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md font-medium transition flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    {editingId ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium transition flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </section>
          
          <section className="w-full lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <List className="text-blue-600" size={28} />
                  Inventario Actual
                </h2>
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
              </div>
              
              {filteredInventory.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    {searchTerm ? 'No se encontraron resultados' : 'No hay materiales registrados'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Intenta con otro término de búsqueda.' : 'Empieza agregando nuevos materiales al inventario.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Registro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.materialId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.materialType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.registerDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-900 transition"
                                title="Editar"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-900 transition"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-white shadow-md mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p>&copy; 2024 CimbraSys. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}