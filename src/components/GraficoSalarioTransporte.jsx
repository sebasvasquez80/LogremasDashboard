import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2'; 
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';

// 1. Registrar los componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    DatalabelsPlugin
);

/**
 * Función que formatea números grandes para mostrar el prefijo K, M, o G.
 * Ejemplo: 192494889 -> "$ 192.5 M"
 */
const formatLargeNumber = (value) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1000000) { // Millones (M)
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
        title: { display: true, text: `Comparación Salario vs Aux. Transporte` },
        tooltip: {
            mode: 'index', 
            intersect: false,
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
        datalabels: {
            align: 'center', // Alineamos la etiqueta en el centro de la sección de la barra
            anchor: 'center',
            offset: 0, 
            formatter: (value) => {
                // Datalabel: Muestra el valor simplificado (M, K)
                return formatLargeNumber(value);
            },
            color: 'black', // Usamos blanco para que se vea bien sobre las barras
            font: {
                weight: 'bold',
                size: 10,
            },
            display: (context) => {
                // Solo mostrar etiquetas si el valor es significativo para evitar amontonamiento
                return context.dataset.data[context.dataIndex] > 10000; 
            }
        }
    },
    layout: {
        padding: { bottom: 30 }
    },
    scales: {
        x: {
            stacked: true, // CLAVE: Barras Apiladas
            ticks: { maxRotation: 45, minRotation: 45, autoSkip: false }
        },
        y: {
            stacked: true, // CLAVE: Barras Apiladas
            ticks: {
                callback: function (value) {
                    // Eje Y: Muestra el valor simplificado (M, K)
                    return formatLargeNumber(value);
                }
            }
        }
    }
};

// --- Componente Principal ---
const GraficoSalarioTransporte = ({ centroId, ano, mesInicio, mesFin }) => {

    const [chartData, setChartData] = useState({ datasets: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!centroId || !ano || !mesInicio || !mesFin) {
            setChartData({ datasets: [] }); 
            setError("Seleccione un Centro de Nómina, Año y Rango de Meses.");
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

                // Llamada al endpoint de SALARIO VS TRANSPORTE
                const response = await axios.get(
                    `${apiUrl}/api/graficos/salario-transporte`, 
                    { params: params, headers: { Authorization: `Bearer ${token}` } }
                ); 

                const rawData = response.data;
                
                // --- TRANSFORMACIÓN EN EL FRONTEND ---
                const labels = rawData.map(item => item.fecha_label);
                
                const finalChartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Salario (Categoría)',
                            data: rawData.map(item => item.salario_total),
                            backgroundColor: 'rgba(54, 162, 235, 0.9)', // Azul
                            borderColor: 'rgb(54, 162, 235)',
                            borderWidth: 1,
                        },
                        {
                            label: 'Aux. Transporte (Categoría)',
                            data: rawData.map(item => item.transporte_total),
                            backgroundColor: 'rgba(255, 159, 64, 0.9)', // Naranja
                            borderColor: 'rgb(255, 159, 64)',
                            borderWidth: 1,
                        }
                    ],
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
            {!loading && !error && chartData.datasets.length > 0 ? (
                <Bar options={options} data={chartData} /> 
            ) : (
                !loading && !error && <p>No hay datos o el período es inválido.</p>
            )}
        </div>
    );
};

export default GraficoSalarioTransporte;