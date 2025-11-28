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

// Colores consistentes para cada tipo de Novedad
const NOVEDAD_COLORS = {
    recaro: { color: 'rgb(255, 99, 132)', alpha: 'rgba(255, 99, 132, 0.8)' },          // Rojo (Recargo)
    extras: { color: 'rgb(54, 162, 235)', alpha: 'rgba(54, 162, 235, 0.8)' },           // Azul (Extras)
    dominical: { color: 'rgb(255, 205, 86)', alpha: 'rgba(255, 205, 86, 0.8)' },    // Amarillo (Dominical)
    bonificacion: { color: 'rgb(75, 192, 192)', alpha: 'rgba(75, 192, 192, 0.8)' },    // Verde (Bonificación)
    incapacidad: { color: 'rgb(153, 102, 255)', alpha: 'rgba(153, 102, 255, 0.8)' }, // Púrpura (Incapacidad)
};

/**
 * Función que formatea números grandes para mostrar el prefijo K, M, o G.
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
        title: { display: true, text: `Composición de Novedades (Recargos y Extras)` },
        tooltip: {
            mode: 'index', 
            callbacks: {
                label: function (context) {
                    let label = context.dataset.label || '';
                    if (label) { label += ': '; }
                    if (context.parsed.y !== null) {
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
        // Mantenemos el datalabel simplificado y centrado para gráficos apilados
        datalabels: {
            align: 'center', 
            anchor: 'center',
            offset: 0, 
            formatter: (value, context) => {
                // CORRECCIÓN CLAVE: Mostrar la abreviatura del nombre
                const label = context.dataset.label; // Ej: 'Recargo'
                
                // Aseguramos que solo mostramos la abreviatura si el valor es > 0
                if (value > 0) {
                    return label.substring(0, 3).toUpperCase(); // 'Rec', 'Ext', etc.
                }
                return null; // No mostrar nada si el valor es cero
            },
            color: 'black', 
            font: {
                weight: 'bold',
                size: 10,
            },
            display: (context) => {
                // Deshabilitamos el display por umbral, confiando en el formatter
                return true; 
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
                    return formatLargeNumber(value);
                }
            }
        }
    }
};

// --- Componente Principal ---
const GraficoNovedades = ({ centroId, ano, mesInicio, mesFin }) => {

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

                // Llamada al endpoint de NOVEDADES
                const response = await axios.get(
                    `${apiUrl}/api/graficos/novedades`, 
                    { params: params, headers: { Authorization: `Bearer ${token}` } }
                ); 

                const rawData = response.data; 
                
                // --- TRANSFORMACIÓN PARA BARRAS APILADAS ---
                const labels = rawData.map(item => item.fecha_label);

                // Mapeo de claves y etiquetas
                const novedadKeys = [
                    { key: 'recaro', label: 'Recargo' },
                    { key: 'extras', label: 'Extras' },
                    { key: 'dominical', label: 'Dominical' },
                    { key: 'bonificacion', label: 'Bonificación' },
                    { key: 'incapacidad', label: 'Incapacidad' },
                ];
                
                const datasets = novedadKeys.map(({ key, label }) => {
                    const colorProps = NOVEDAD_COLORS[key]; 
                    
                    return {
                        label: label,
                        data: rawData.map(item => item[`${key}_total`]), // Usamos el sufijo _total de la función SQL
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
                console.error("Error cargando datos del gráfico de novedades:", err);
                setError('Error al cargar datos del gráfico de novedades.');
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

export default GraficoNovedades;