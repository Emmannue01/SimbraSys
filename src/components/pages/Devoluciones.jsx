import React, { useState, useEffect } from 'react';
import { RotateCw, Search, Package, CheckCircle, Clock } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, query, where, doc, addDoc, serverTimestamp, orderBy, limit, runTransaction } from "firebase/firestore";

const Returns = () => {
  const [searchInput, setSearchInput] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // Default to all statuses
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [returnsHistory, setReturnsHistory] = useState([]);

  useEffect(() => {
    fetchReturnsHistory();
  }, []);

  const fetchReturnsHistory = async () => {
    const returnsCollectionRef = collection(db, "returns");
    const q = query(returnsCollectionRef, orderBy("returnDate", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setReturnsHistory(history);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', { timeZone: 'UTC' });
  };

  const searchContracts = async () => {
    const contractsRef = collection(db, "contracts");
    let q;

    if (filterStatus) {
      q = query(contractsRef, where('status', '==', filterStatus));
    } else {
      q = query(contractsRef, orderBy("createdAt", "desc")); // Show all, newest first
    }
    
    const querySnapshot = await getDocs(q);
    let foundContracts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (searchInput.trim()) {
      const lowercasedInput = searchInput.toLowerCase();
      foundContracts = foundContracts.filter(c => 
        c.contractNumber.toLowerCase().includes(lowercasedInput) ||
        c.clientName.toLowerCase().includes(lowercasedInput) ||
        c.clientProject.toLowerCase().includes(lowercasedInput)
      );
    }

    setContracts(foundContracts);
    setSelectedContract(null);
  };

  const handleContractClick = (contract) => {
    setSelectedContract(contract);
  };

  const handleRegisterReturn = async () => {
    if (!selectedContract) return;

    try {
      // Usar una transacción para asegurar la consistencia de los datos
      await runTransaction(db, async (transaction) => {
        // 1. LEER PRIMERO: Obtener referencias a los documentos que se modificarán.
        const contractRef = doc(db, "contracts", selectedContract.id);
        const inventoryQuery = query(collection(db, "inventory"), where("contractId", "==", selectedContract.contractNumber));
        const rentedItemsSnapshot = await getDocs(inventoryQuery); // Esta lectura está bien aquí, ya que es para encontrar los documentos a procesar.

        const sourceDocsToUpdate = [];
        for (const rentedDoc of rentedItemsSnapshot.docs) {
          const rentedItem = rentedDoc.data();
          if (rentedItem.sourceInventoryId) {
            const sourceInventoryRef = doc(db, "inventory", rentedItem.sourceInventoryId);
            const sourceDoc = await transaction.get(sourceInventoryRef); // Lectura transaccional
            if (sourceDoc.exists()) {
              sourceDocsToUpdate.push({ sourceDoc, rentedItem, rentedDocRef: rentedDoc.ref });
            }
          }
        }

        // 2. ESCRIBIR DESPUÉS: Ahora que todas las lecturas terminaron, realizar las escrituras.
        transaction.update(contractRef, { status: "Devuelto" });

        for (const { sourceDoc, rentedItem, rentedDocRef } of sourceDocsToUpdate) {
          const newQuantity = sourceDoc.data().quantity + rentedItem.quantity;
          transaction.update(sourceDoc.ref, { quantity: newQuantity });
          transaction.delete(rentedDocRef);
        }
      });

      // 3. Crear un registro en la colección 'returns' (fuera de la transacción si es solo para historial)
      const returnsRef = collection(db, "returns");
      await addDoc(returnsRef, {
        contractId: selectedContract.contractNumber,
        clientName: selectedContract.clientName,
        returnDate: serverTimestamp(),
        materials: selectedContract.materials.map(m => `${m.quantity} x ${m.name}`).join(', '),
      });
      
      alert('Devolución registrada exitosamente');
      setSelectedContract(null);
      setContracts([]);
      setSearchInput('');
      fetchReturnsHistory();
    } catch (error) {
      console.error("Error al registrar la devolución: ", error);
      alert('Hubo un error al registrar la devolución.');
    }
  };

  const handleRevertReturn = async () => {
    if (!selectedContract || selectedContract.status !== 'Devuelto') return;

    try {
      await runTransaction(db, async (transaction) => {
        // 1. LEER PRIMERO: Obtener referencias y leer los documentos necesarios.
        const contractRef = doc(db, "contracts", selectedContract.id);
        const sourceDocsToUpdate = [];

        for (const material of selectedContract.materials) {
          const sourceInventoryId = material.inventoryId; // Asumimos que este es el ID del lote original
          if (sourceInventoryId) {
            const sourceInventoryRef = doc(db, "inventory", sourceInventoryId);
            const sourceDoc = await transaction.get(sourceInventoryRef); // Lectura transaccional
            if (!sourceDoc.exists() || sourceDoc.data().quantity < material.quantity) {
              throw new Error(`No se puede revertir: el stock original para ${material.name} no existe o no tiene suficiente cantidad.`);
            }
            sourceDocsToUpdate.push({ sourceInventoryRef, material });
          }
        }

        // 2. ESCRIBIR DESPUÉS: Ahora que todas las lecturas terminaron, realizar las escrituras.
        transaction.update(contractRef, { status: "Rentado" });

        for (const { sourceInventoryRef, material } of sourceDocsToUpdate) {
          const sourceDoc = await transaction.get(sourceInventoryRef); // Re-lectura para obtener la cantidad actual en la transacción
          const newSourceQuantity = sourceDoc.data().quantity - material.quantity;
          transaction.update(sourceInventoryRef, { quantity: newSourceQuantity });

          const newRentedItemRef = doc(collection(db, "inventory"));
          transaction.set(newRentedItemRef, {
                materialType: material.name,
                quantity: material.quantity,
                status: "Rentado",
                contractId: selectedContract.contractNumber,
                sourceInventoryId: sourceInventoryId,
                createdAt: serverTimestamp()
              });
        }
      });
      alert('Devolución revertida exitosamente. El contrato está activo de nuevo.');
      setSelectedContract(null);
      searchContracts(); // Refrescar la lista
    } catch (error) {
      console.error("Error al revertir la devolución: ", error);
      alert(`Hubo un error al revertir la devolución: ${error.message}`);
    }
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
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="md:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    id="searchInput"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Buscar por ID de contrato, nombre de cliente o proyecto..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
              </div>
              <div className="md:col-span-1">
                <button
                  onClick={searchContracts}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition flex items-center justify-center gap-2"
                >
                  <Search size={18} />
                  Buscar
                </button>
              </div>
              <div>
                <select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="Rentado">Pendiente (Rentado)</option>
                  <option value="Devuelto">Devuelto</option>
                </select>
              </div>
            </div>

            {contracts.length > 0 && (
              <div id="contractResults" className="mt-4 space-y-2">
                {contracts.map(contract => (
                  <div
                    key={contract.id}
                    onClick={() => handleContractClick(contract)}
                    className={`p-4 border rounded-md hover:bg-blue-50 cursor-pointer ${selectedContract?.id === contract.id ? 'bg-blue-100 border-blue-400' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Contrato: {contract.contractNumber}</h3>
                        <p className="text-sm text-gray-600">Cliente: {contract.clientName}</p>
                        <p className="text-sm text-gray-600">Proyecto: {contract.clientProject}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Fecha inicio: {formatDate(contract.startDate)}</p>
                        <p className="text-sm">Fecha devolución: {formatDate(contract.returnDate)}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${contract.status === 'Rentado' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {contract.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Materiales a Devolver */}
          {selectedContract && (
            <section id="materialsSection" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="text-blue-600" />
                Materiales a Devolver del Contrato {selectedContract.contractNumber}
              </h2>
              
              <div className="overflow-x-auto">
                <table id="materialsTable" className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Material
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody id="materialsBody" className="bg-white divide-y divide-gray-200">
                    {selectedContract.materials.map((material, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {material.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {material.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Rentado</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                {selectedContract.status === 'Rentado' && (
                  <button
                    id="registerReturnBtn"
                    onClick={handleRegisterReturn}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium transition duration-150 ease-in-out flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Registrar Devolución
                  </button>
                )}
                {selectedContract.status === 'Devuelto' && (
                  <button
                    onClick={handleRevertReturn}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-6 rounded-md font-medium transition duration-150 ease-in-out flex items-center gap-2"
                  >
                    <RotateCw className="w-5 h-5" />
                    Revertir Devolución
                  </button>
                )}
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
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.returnDate?.toDate().toLocaleDateString('es-MX') || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.contractId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.materials}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Completado
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
    </div>
  );
};

export default Returns;