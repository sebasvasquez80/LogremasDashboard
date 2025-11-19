import React, { useState, useEffect } from 'react';
import axios from 'axios';
// CAMBIO 1: Importamos Bar para gráfico de barras
import { Bar } from 'react-chartjs-2'; 
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    // CAMBIO 2: Importamos BarElement
    BarElement, 
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
// Importamos y registramos el plugin de datalabels
import DatalabelsPlugin from 'chartjs-plugin-datalabels';

// 1. Registrar los componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    // CAMBIO 3: Registramos BarElement
    BarElement, 
    Title,
    Tooltip,
    Legend,
    DatalabelsPlugin
);

/**
 * Función que formatea números grandes para mostrar el prefijo K, M, o G.
 * Muestra el valor simplificado (ej: 192,494,889 -> "$ 192.5 M").
 * @param {number} value - El número de la base de datos
 * @returns {string} El valor formateado simplificado
 */
const formatLargeNumber = (value) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1000000) { // Millones (M)
        // Divide por 1M y formatea con un decimal, manteniendo la simplificación
        const formatted = (absValue / 1000000).toFixed(1);
        return `${sign}$ ${formatted} M`;
    }
    if (absValue >= 1000) { // Miles (K)
        const formatted = new Intl.NumberFormat('es-CO', {
            maximumFractionDigits: 0
        }).format(absValue / 1000);
        return `${sign}$ ${formatted} K`;
    }
    return `${sign}$ ${new Intl.NumberFormat('es-CO').format(absValue)}`;
};


const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
        title: { display: true, text: `Costo Mensual de Nómina` },
        tooltip: {
            callbacks: {
                label: function (context) {
                    let label = context.dataset.label || '';
                    if (label) { label += ': '; }
                    if (context.parsed.y !== null) {
                        // Tooltip: Muestra el valor completo en pesos
                        label += new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            maximumFractionDigits: 0,
                        }).format(context.parsed.y);
                    }
                    return label;
                }
            }
        },
        // CONFIGURACIÓN DEL DATALABELS (Etiquetas Permanentes)
        datalabels: {
            align: 'end', // Muestra la etiqueta en la parte superior de la barra
            anchor: 'end',
            offset: 4, // Pequeño offset para que no toque la barra
            formatter: (value) => {
                // Datalabel: Muestra el valor simplificado (M, K)
                return formatLargeNumber(value);
            },
            color: '#333', 
            font: {
                weight: 'bold'
            },
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
                // Eje Y: Muestra el valor simplificado (M, K)
                callback: function (value) {
                    return formatLargeNumber(value);
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
const GraficoNomina = ({ centroId, ano, mesInicio, mesFin }) => {

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

                // Llamada al endpoint de NÓMINA
                const response = await axios.get(
                    `${apiUrl}/api/graficos/nomina`, 
                    { 
                        params: params,
                        headers: { Authorization: `Bearer ${token}` }
                    }
                ); 

                const rawData = response.data; 

                // TRANSFORMACIÓN EN EL FRONTEND
                const labels = rawData.map(item => item.fecha_label);
                const valores = rawData.map(item => item.nomina_valor);

                const finalChartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Costo de Nómina',
                            data: valores,
                            // Propiedades para la barra
                            backgroundColor: 'rgba(255, 159, 64, 0.8)',
                            borderColor: 'rgb(255, 159, 64)',
                            borderWidth: 1,
                        }
                    ]
                };

                setChartData(finalChartData);
                if (rawData.length === 0) {
                    setError("No hay datos para este Centro/Período.");
                }

            } catch (err) {
                console.error("Error cargando datos del gráfico de nómina:", err);
                setError('Error al cargar datos del gráfico de nómina.');
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
        {/* CAMBIO 4: Renderiza <Bar> */}
            {!loading && !error && chartData.datasets.length > 0 ? (
                <Bar options={options} data={chartData} /> 
            ) : (
                !loading && !error && <p>No hay datos o el período es inválido.</p>
            )}
        </div>
    );
};

export default GraficoNomina;