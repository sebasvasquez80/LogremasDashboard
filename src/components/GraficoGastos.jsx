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
// Importamos el plugin Datalabels para poder deshabilitarlo
import DatalabelsPlugin from 'chartjs-plugin-datalabels';

// 1. Registrar los componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    // Registramos Datalabels
    DatalabelsPlugin 
);

// Colores consistentes para cada tipo de gasto.
const GASTO_COLORS = {
    nomina: { color: 'rgb(255, 99, 132)', alpha: 'rgba(255, 99, 132, 0.8)' },
    aux_transporte: { color: 'rgb(54, 162, 235)', alpha: 'rgba(54, 162, 235, 0.8)' },
    prestaciones: { color: 'rgb(255, 205, 86)', alpha: 'rgba(255, 205, 86, 0.8)' },
    gastos_fijos: { color: 'rgb(75, 192, 192)', alpha: 'rgba(75, 192, 192, 0.8)' },
    gastos_variable: { color: 'rgb(153, 102, 255)', alpha: 'rgba(153, 102, 255, 0.8)' },
};

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
        legend: { position: 'bottom' },
        title: { display: true, text: `Composición de Gastos Mensuales` },
        tooltip: {
            mode: 'index', // Mostrará la suma total de las 5 barras en el tooltip
            callbacks: {
                label: function (context) {
                    let label = context.dataset.label || '';
                    if (label) { label += ': '; }
                    if (context.parsed.y !== null) {
                        // Formatea el tooltip completo con signo de pesos
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
        // CORRECCIÓN CLAVE: Deshabilitar el datalabel para este gráfico
        datalabels: {
            display: false
        }
    },
    layout: {
        padding: { bottom: 30 }
    },
    scales: {
        x: {
            stacked: true, // Apila las barras en el eje X
            ticks: { maxRotation: 45, minRotation: 45, autoSkip: false }
        },
        y: {
            stacked: true, // Apila las barras en el eje Y
            ticks: {
                callback: function (value) {
                    // Formatea el eje Y con la función de simplificación (M, K)
                    return formatLargeNumber(value);
                }
            }
        }
    }
};

// --- Componente Principal ---
const GraficoGastos = ({ centroId, ano, mesInicio, mesFin }) => {

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

                // Llamada al endpoint de GASTOS
                const response = await axios.get(
                    `${apiUrl}/api/graficos/gastos`, 
                    { params: params, headers: { Authorization: `Bearer ${token}` } }
                ); 

                const rawData = response.data; // Array de objetos con 5 campos de gasto + fecha_label
                
                // --- TRANSFORMACIÓN COMPLEJA PARA BARRAS APILADAS ---
                const labels = rawData.map(item => item.fecha_label);

                // Nombres de las columnas de gasto en el orden deseado
                const gastoKeys = [
                    { key: 'nomina', label: 'Nómina' },
                    { key: 'aux_transporte', label: 'Aux. Transporte' },
                    { key: 'prestaciones', label: 'Prestaciones' },
                    { key: 'gastos_fijos', label: 'Gastos Fijos' },
                    { key: 'gastos_variable', label: 'Gastos Variables' },
                ];
                
                const datasets = gastoKeys.map(({ key, label }) => {
                    const colorProps = GASTO_COLORS[key]; 
                    
                    return {
                        label: label,
                        data: rawData.map(item => item[key]), 
                        backgroundColor: colorProps ? colorProps.alpha : 'rgba(100, 100, 100, 0.8)', 
                        borderColor: colorProps ? colorProps.color : 'rgb(100, 100, 100)',
                        borderWidth: 1,
                    };
                });

                const finalChartData = {
                    labels: labels,
                    datasets: datasets,
                };

                setChartData(finalChartData);
                if (rawData.length === 0) {
                    setError("No hay datos para este Centro/Período.");
                }

            } catch (err) {
                console.error("Error cargando datos del gráfico de gastos:", err);
                setError('Error al cargar datos del gráfico de gastos.');
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
                // Renderiza Bar Chart
                <Bar options={options} data={chartData} /> 
            ) : (
                !loading && !error && <p>No hay datos o el período es inválido.</p>
            )}
        </div>
    );
};

export default GraficoGastos;