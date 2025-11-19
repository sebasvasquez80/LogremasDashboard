import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// 1. Registrar los componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Opciones de Chart.js para formatear los porcentajes
const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
        title: { display: true, text: `Utilidad Mensual` },
        tooltip: {
            callbacks: {
                label: function (context) {
                    let label = context.dataset.label || '';
                    if (label) { label += ': '; }
                    if (context.parsed.y !== null) {
                        // Formato de porcentaje en el tooltip
                        label += (context.parsed.y * 100).toFixed(2) + ' %';
                    }
                    return label;
                }
            }
        },
    },
    scales: {
        y: {
            ticks: {
                callback: function (value) {
                    // Formato de porcentaje en el eje Y
                    return (value * 100).toFixed(0) + ' %';
                }
            }
        }
    }
};

// --- Componente Principal ---
// Acepta los filtros como props
const GraficoUtilidad = ({ centroId, ano, mes }) => {

    const [chartData, setChartData] = useState({ datasets: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Efecto: Cargar los datos del gráfico
    useEffect(() => {
        // Validación: Detener la carga si faltan los filtros obligatorios
        if (!centroId || !ano) {
            setChartData({ datasets: [] }); 
            setError("Seleccione un Centro y Año válidos.");
            return;
        }

        const fetchChartData = async () => {
            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("Usuario no autenticado.");
                    setLoading(false);
                    return;
                }

                const apiUrl = import.meta.env.VITE_API_URL;

                // Construimos los parámetros con las props
                const params = {
                    centroId: centroId,
                    ano: ano,
                    mes: mes || null, // Mes es opcional
                };

                // Llamada al backend con el token
                const response = await axios.get(
                    `${apiUrl}/api/graficos/utilidad`, 
                    { 
                        params: params,
                        headers: { Authorization: `Bearer ${token}` }
                    }
                ); 

                // --- TRANSFORMACIÓN DE DATOS ---
                const rawData = response.data;
                
                const labels = rawData.map(item => item.fecha_label);
                const valores = rawData.map(item => item.utilidad_valor);
                
                const finalChartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Utilidad',
                            data: valores,
                            fill: false,
                            borderColor: 'rgb(54, 162, 235)', 
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            tension: 0.1 
                        }
                    ]
                };

                setChartData(finalChartData);
                if (rawData.length === 0) {
                    setError("No hay datos para este Centro/Período.");
                }

            } catch (err) {
                console.error("Error cargando datos del gráfico:", err);
                if (err.response && err.response.data && err.response.data.message) {
                    setError(`Error: ${err.response.data.message}`);
                } else {
                    setError('Error al cargar datos del gráfico.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [centroId, ano, mes]); // Depende solo de las props

    // --- Renderizado (JSX) ---
    return (
        <div style={{ height: '400px', position: 'relative' }}>
            {loading && <p>Cargando gráfico...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && chartData.datasets.length > 0 ? (
                <Line options={options} data={chartData} />
            ) : (
                !loading && !error && <p>No hay datos o el período es inválido.</p>
            )}
        </div>
    );
};

export default GraficoUtilidad;