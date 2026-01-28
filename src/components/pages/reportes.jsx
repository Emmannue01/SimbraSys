import React, { useState, useEffect } from 'react';
import { BarChart2, Download } from 'lucide-react';
import { Chart, registerables } from 'chart.js/auto';

Chart.register(...registerables);
export default function ReportsIncome() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalIncome, setTotalIncome] = useState(24820.00);
  const [activeContracts, setActiveContracts] = useState(8);
  const [rentedMaterials, setRentedMaterials] = useState(215);
  const [rentals, setRentals] = useState([]);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    // Inicializar gráfica
    let chart;
    const ctx = document.getElementById('incomeChart');
    if (ctx) {
      // Destruir cualquier instancia de gráfico existente en este canvas
      const existingChart = Chart.getChart(ctx);
      if (existingChart) {
        existingChart.destroy();
      }
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          datasets: [{
            label: 'Ingresos',
            data: [3500, 4200, 3800, 5100, 4600, 5200],
            borderColor: 'rgb(37, 99, 235)',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            tension: 0.4
          }]
        },
        options: {
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
                  return '$' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    }

    // Cargar datos de ejemplo
    loadSampleRentals();

    return () => {
      // Limpieza al desmontar el componente
      chart?.destroy();
    };
  }, []);

  const loadSampleRentals = () => {
    const sampleData = [
      {
        id: 'C-001',
        client: 'Constructora ABC',
        startDate: '2024-10-15',
        returnDate: '2024-11-15',
        amount: 5600.00,
        status: 'Activo'
      },
      {
        id: 'C-002',
        client: 'Obras del Norte',
        startDate: '2024-10-20',
        returnDate: '2024-11-20',
        amount: 3200.00,
        status: 'Activo'
      },
      {
        id: 'C-003',
        client: 'Desarrollo Urbano SA',
        startDate: '2024-09-01',
        returnDate: '2024-10-01',
        amount: 8500.00,
        status: 'Finalizado'
      }
    ];
    setRentals(sampleData);
  };

  const handlePeriodFilter = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleFilter = () => {
    // Implementar lógica de filtrado
    console.log('Filtrando desde', startDate, 'hasta', endDate);
  };

  const handleExportPDF = () => {
    console.log('Exportando PDF...');
  };

  const handleExportExcel = () => {
    console.log('Exportando Excel...');
  };

  const getStatusColor = (status) => {
    return status === 'Activo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
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
              <tbody className="bg-white divide-y divide-gray-200">
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