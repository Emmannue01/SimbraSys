import React, { useState, useEffect } from 'react';
import { BarChart2, Download } from 'lucide-react';
import { Chart, registerables } from 'chart.js/auto';
import { db } from '../firebase';
import { collection, getDocs, query, where } from "firebase/firestore";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

Chart.register(...registerables);
export default function ReportsIncome() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalIncome, setTotalIncome] = useState(0);
  const [activeContracts, setActiveContracts] = useState(0);
  const [rentedMaterials, setRentedMaterials] = useState(0);
  const [rentals, setRentals] = useState([]);
  const [allRentals, setAllRentals] = useState([]);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    if (allRentals.length > 0) {
      updateDashboard(rentals.length > 0 ? rentals : allRentals);
    }
  }, [rentals, allRentals]);

  const fetchContracts = async () => {
    const contractsCollectionRef = collection(db, "contracts");
    const q = query(contractsCollectionRef);
    const querySnapshot = await getDocs(q);
    const contractsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Asegurarse que los campos de fecha son consistentes
      startDate: doc.data().startDate,
      returnDate: doc.data().returnDate,
      amount: doc.data().totalCost,
      client: doc.data().clientName,
      status: doc.data().status,
    }));
    setAllRentals(contractsData);
    setRentals(contractsData);
  };

  const updateDashboard = (data) => {
    // Calcular estadísticas
    const total = data.reduce((sum, rental) => sum + rental.amount, 0);
    const active = data.filter(rental => rental.status === 'Rentado').length;
    const materials = data.reduce((sum, rental) => {
      if (rental.status === 'Rentado') {
        return sum + rental.materials.reduce((matSum, mat) => matSum + mat.quantity, 0);
      }
      return sum;
    }, 0);

    setTotalIncome(total);
    setActiveContracts(active);
    setRentedMaterials(materials);

    // Actualizar gráfica
    const monthlyIncome = {};
    const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    data.forEach(rental => {
      const date = new Date(rental.startDate);
      const month = date.getMonth();
      if (monthlyIncome[month]) {
        monthlyIncome[month] += rental.amount;
      } else {
        monthlyIncome[month] = rental.amount;
      }
    });

    const chartData = Array(12).fill(0);
    for (const month in monthlyIncome) {
      chartData[month] = monthlyIncome[month];
    }

    const ctx = document.getElementById('incomeChart');
    if (ctx) {
      if (chartInstance) {
        chartInstance.destroy();
      }
      const newChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: monthLabels,
          datasets: [{
            label: 'Ingresos',
            data: chartData,
            borderColor: 'rgb(37, 99, 235)',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            tension: 0.4
          }]
        },
        options: chartOptions
      });
      setChartInstance(newChart);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString('es-MX', { minimumFractionDigits: 2 });
          }
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      chartInstance?.destroy();
    };
  }, [chartInstance]);

  const handlePeriodFilter = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleFilter = () => {
    if (!startDate || !endDate) {
      setRentals(allRentals);
      return;
    }
    const filtered = allRentals.filter(rental => {
      const rentalDate = new Date(rental.startDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return rentalDate >= start && rentalDate <= end;
    });
    setRentals(filtered);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Rentas", 14, 16);
    doc.autoTable({
      head: [['Contrato', 'Cliente', 'Fecha Inicio', 'Fecha Devolución', 'Monto Total', 'Estado']],
      body: rentals.map(r => [
        r.id,
        r.client,
        r.startDate,
        r.returnDate,
        `$${r.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
        r.status
      ]),
      startY: 20,
    });
    doc.save('reporte_rentas.pdf');
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rentals.map(r => ({
      'Contrato': r.id,
      'Cliente': r.client,
      'Fecha Inicio': r.startDate,
      'Fecha Devolución': r.returnDate,
      'Monto Total': r.amount,
      'Estado': r.status
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rentas");
    XLSX.writeFile(workbook, "reporte_rentas.xlsx");
  };

  const getStatusColor = (status) => {
    return status === 'Rentado' 
      ? 'bg-yellow-100 text-yellow-800' 
      : 'bg-green-100 text-green-800';
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <BarChart2 className="text-blue-600" size={32} />
            Reportes e Ingresos
          </h1>
          <div className="flex gap-3">
            <button 
              onClick={handleExportPDF}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium flex items-center gap-2"
            >
              <Download size={16} />
              PDF
            </button>
            <button 
              onClick={handleExportExcel}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium flex items-center gap-2"
            >
              <Download size={16} />
              Excel
            </button>
          </div>
        </div>

        {/* Filtros y Estadísticas */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-3">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtrar por período</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Desde
                </label>
                <input 
                  type="date" 
                  id="startDate" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Hasta
                </label>
                <input 
                  type="date" 
                  id="endDate" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleFilter}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
                >
                  Filtrar
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button 
                onClick={() => handlePeriodFilter(1)}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200"
              >
                Hoy
              </button>
              <button 
                onClick={() => handlePeriodFilter(7)}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200"
              >
                Últimos 7 días
              </button>
              <button 
                onClick={() => handlePeriodFilter(30)}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200"
              >
                Últimos 30 días
              </button>
              <button 
                onClick={() => handlePeriodFilter(90)}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200"
              >
                Últimos 3 meses
              </button>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumen</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Ingresos totales</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contratos activos</p>
                <p className="text-xl font-semibold text-gray-800">{activeContracts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Materiales rentados</p>
                <p className="text-xl font-semibold text-gray-800">{rentedMaterials}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Gráfica */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ingresos por período</h2>
          <div className="h-80">
            <canvas id="incomeChart"></canvas>
          </div>
        </section>

        {/* Tabla de rentas */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalle de rentas</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contrato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Devolución
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200" id="rentals-table-body">
                {rentals.map((rental) => (
                  <tr key={rental.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rental.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rental.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rental.startDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rental.returnDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${rental.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(rental.status)}`}>
                        {rental.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}