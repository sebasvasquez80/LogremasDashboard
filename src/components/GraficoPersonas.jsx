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
import DatalabelsPlugin from 'chartjs-plugin-datalabels';


// 1. Registrar los componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    DatalabelsPlugin
);

// Opciones de Chart.js (movidas aquí)
const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
        title: { display: true, text: `Cantidad de Personal` },
        tooltip: {
            callbacks: {
                label: function (context) {
                    let label = context.dataset.label || '';
                    if (label) { label += ': '; }
                    if (context.parsed.y !== null) {
                        // Formato de número entero sin decimales para personas
                        label += new Intl.NumberFormat('es-CO').format(context.parsed.y);
                    }
                    return label;
                }
            }
        },
        datalabels: {
            align: 'top', // Posición encima del punto
            formatter: (value) => {
                // CORRECCIÓN: Formatear el valor como número entero con separador de miles
                // (Ej: 1500 -> 1.500)
                return new Intl.NumberFormat('es-CO', {
                    maximumFractionDigits: 0
                }).format(value);
            },
            color: '#333', // Color de la etiqueta
            font: {
                weight: 'bold'
            },
            // Aseguramos que la etiqueta no se muestre si el valor es 0 o null
            display: (context) => {
                return context.dataset.data[context.dataIndex] !== 0;
            }
        }

    },
    layout: {
        padding: {
            bottom: 30, // Espacio para las etiquetas rotadas
        }
    },
    scales: {
        y: {
            ticks: {
                callback: function (value) {
                    // Muestra el valor como un número entero
                    return new Intl.NumberFormat('es-CO').format(value);
                }
            }
        },
        x: {
            ticks: {
                maxRotation: 45,
                minRotation: 45,
                autoSkip: false,
            }
        }
    }
};

// --- Componente Principal ---
const GraficoPersonas = ({ centroId, ano, mesInicio, mesFin }) => {

    const [chartData, setChartData] = useState({ datasets: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!centroId || !ano || !mesInicio || !mesFin) {
            setChartData({ datasets: [] });
            setError("Seleccione un Centro, Año y Rango de Meses.");
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
                const params = { centroId, ano, mesInicio, mesFin };

                // Llamada al endpoint de PERSONAS
                const response = await axios.get(
                    `${apiUrl}/api/graficos/personas`,
                    {
                        params: params,
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                const rawData = response.data; // Datos puros: [ { fecha_label: 'Ene', personas_valor: 50 }, ... ]

                // 2. TRANSFORMACIÓN EN EL FRONTEND
                const labels = rawData.map(item => item.fecha_label);
                const valores = rawData.map(item => item.personas_valor);

                const finalChartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Cantidad de Personas',
                            data: valores,
                            fill: true, // Estilos movidos aquí
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.4)',
                            tension: 0
                        }
                    ]
                };

                setChartData(finalChartData);
                if (rawData.length === 0) {
                    setError("No hay datos para este Centro/Período.");
                }

            } catch (err) {
                console.error("Error cargando datos del gráfico de personas:", err);
                setError('Error al cargar datos del gráfico de personas.');
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [centroId, ano, mesInicio, mesFin]);

    return (
        <div className="chart-wrapper">
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

export default GraficoPersonas;