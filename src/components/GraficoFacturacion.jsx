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
// 1. IMPORTAR EL PLUGIN DE ETIQUETAS DE DATOS
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
    // 2. REGISTRAR EL PLUGIN
    DatalabelsPlugin
);

/**
 * Función que formatea números grandes para mostrar el prefijo K, M, o G.
 * Muestra solo las 3 primeras cifras significativas de la parte entera de los millones.
 * Ejemplo: 192494889 -> "$ 192 M"
 * @param {number} value - El número de la base de datos
 * @returns {string} El valor formateado simplificado
 */
const formatLargeNumber = (value) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1000000) { // Millones (M)
        // 1. Divide por 1M (Ej: 192,494,889 / 1,000,000 = 192.494889)
        const millions = absValue / 1000000; 
        
        // 2. Toma solo la parte entera (192)
        const integerPart = Math.floor(millions); 
        
        // 3. Formatea la parte entera con separador de miles si es necesario
        const formatted = new Intl.NumberFormat('es-CO', {
            maximumFractionDigits: 0
        }).format(integerPart);

        // Retorna el valor con el sufijo 'M'
        return `${sign}$ ${formatted} M`;
    }
    if (absValue >= 1000) { // Miles (K)
        // Mantiene la lógica de miles
        const formatted = new Intl.NumberFormat('es-CO', {
            maximumFractionDigits: 0
        }).format(absValue / 1000);
        return `${sign}$ ${formatted} K`;
    }
    // Formato normal para números pequeños
    return `${sign}$ ${new Intl.NumberFormat('es-CO').format(absValue)}`;
};


const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
        title: { display: true, text: `Facturación Mensual` },
        tooltip: {
            callbacks: {
                label: function (context) {
                    let label = context.dataset.label || '';
                    if (label) { label += ': '; }
                    if (context.parsed.y !== null) {
                        // AQUÍ SE MUESTRA EL VALOR COMPLETO
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
            align: 'top',
            formatter: (value) => {
                // AQUÍ USAMOS LA FUNCIÓN DE SIMPLIFICACIÓN
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
                // Formatea el eje Y con la función de simplificación (M, K)
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
const GraficoFacturacion = ({ centroId, ano, mesInicio, mesFin }) => {

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

                // Llamada al endpoint de FACTURACIÓN
                const response = await axios.get(
                    `${apiUrl}/api/graficos/facturacion`, 
                    { 
                        params: params,
                        headers: { Authorization: `Bearer ${token}` }
                    }
                ); 

                const rawData = response.data; // Datos puros: [ { fecha_label: 'Ene', facturacion_valor: 192494889 }, ... ]

                // TRANSFORMACIÓN EN EL FRONTEND
                const labels = rawData.map(item => item.fecha_label);
                const valores = rawData.map(item => item.facturacion_valor);

                const finalChartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Facturación',
                            data: valores,
                            fill: true, // Lo cambié a true para que se vea sombreado como el de Personas
                            borderColor: 'rgb(75, 192, 192)', // Color Verde
                            backgroundColor: 'rgba(75, 192, 192, 0.4)',
                            tension: 0 // Línea curva para Facturación
                        }
                    ]
                };

                setChartData(finalChartData);
                if (rawData.length === 0) {
                    setError("No hay datos para este Centro/Período.");
                }

            } catch (err) {
                console.error("Error cargando datos del gráfico de facturación:", err);
                setError('Error al cargar datos del gráfico de facturación.');
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

export default GraficoFacturacion;