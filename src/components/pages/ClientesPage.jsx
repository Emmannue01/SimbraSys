import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Search, Save, X, Edit2, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

export default function ClientesPage() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    project: ''
  });

  const clientsCollectionRef = collection(db, "clients");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const q = query(clientsCollectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const clientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsData);
    } catch (error) {
      console.error("Error al cargar los clientes: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.project) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    try {
      if (editingId) {
        const clientDoc = doc(db, "clients", editingId);
        await updateDoc(clientDoc, formData);
      } else {
        await addDoc(clientsCollectionRef, {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      fetchClients();
      handleCancel();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert('Error al guardar el cliente');
    }
  };

  const handleEdit = (client) => {
    // Asegurarse de que todos los campos del formulario estén definidos
    const { name = '', phone = '', address = '', project = '' } = client;
    setFormData({ name, phone, address, project });
    setEditingId(client.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        const clientDoc = doc(db, "clients", id);
        await deleteDoc(clientDoc);
        fetchClients();
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', phone: '', address: '', project: '' });
    setEditingId(null);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          <section className="w-full lg:w-1/3 print:hidden">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <UserPlus className="text-blue-600" size={24} />
                {editingId ? 'Editar Cliente' : 'Registrar Cliente'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de Obra/Proyecto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    {editingId ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out flex items-center justify-center gap-2"
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
                  <Users className="text-blue-600" size={24} />
                  Lista de Clientes
                </h2>
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
              </div>
              
              {filteredClients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teléfono
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Obra/Proyecto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {client.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.project}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(client)}
                                className="text-blue-600 hover:text-blue-800 transition"
                                title="Editar"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(client.id)}
                                className="text-red-600 hover:text-red-800 transition"
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
              ) : (
                <p className="text-gray-500">No se encontraron clientes.</p>
              )}
            </div>
          </section>
        </div>
    </div>
  );
}