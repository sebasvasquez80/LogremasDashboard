import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2'; 
import {
    Chart as ChartJS,
    ArcElement, // Elemento para gráficos de torta/dona
    Tooltip,
    Legend,
} from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';

// 1. Registrar los componentes de Chart.js
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    DatalabelsPlugin
);

// Colores consistentes para cada tipo de Novedad (Deben coincidir con GraficoNovedades.jsx)
const NOVEDAD_COLORS = [
    'rgba(255, 99, 132, 0.8)',      // Rojo (Recargo)
    'rgba(54, 162, 235, 0.8)',      // Azul (Extras)
    'rgba(255, 205, 86, 0.8)',     // Amarillo (Dominical)
    'rgba(75, 192, 192, 0.8)',      // Verde (Bonificación)
    'rgba(153, 102, 255, 0.8)',     // Púrpura (Incapacidad)
];

/**
 * Función que formatea el valor absoluto con signo de pesos y separadores de miles.
 */
const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(value);
};

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { 
            position: 'bottom', // CORRECCIÓN 1: Movemos la leyenda a la parte inferior
        },
        title: { display: true, text: `Distribución Total de Novedades` },
        tooltip: {
            callbacks: {
                label: function (context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    
                    // Tooltip: Nombre + Valor completo + Porcentaje (Mantenemos el detalle aquí)
                    return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                }
            }
        },
        // CLAVE: Configuración del datalabel para mostrar Valor y Porcentaje
        datalabels: {
            formatter: (value, context) => {
                const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                if (total === 0) return '';
                
                const percentage = ((value / total) * 100).toFixed(1);

                // CORRECCIÓN 2: Mostramos solo el porcentaje
                return `${percentage}%`;
            },
            color: 'black', // Texto en blanco para contraste
            textAlign: 'center',
            font: {
                weight: 'bold',
                size: 11
            },
            display: (context) => {
                // Solo mostrar etiquetas si el segmento es visible
                return context.dataset.data[context.dataIndex] > 0;
            }
        }
    },
    // CORRECCIÓN 3: Ajuste de padding si es necesario
    layout: {
        padding: {
            top: 20,
            bottom: 20,
            left: 10,
            right: 10,
        }
    }
};

// --- Componente Principal ---
const GraficoTortaNovedades = ({ centroId, ano, mesInicio, mesFin }) => {

    const [rawData, setRawData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!centroId || !ano || !mesInicio || !mesFin) {
            setRawData({}); 
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

                // Llamada al endpoint de TORTA DE NOVEDADES
                const response = await axios.get(
                    `${apiUrl}/api/graficos/novedades-torta`, 
                    { params: params, headers: { Authorization: `Bearer ${token}` } }
                ); 

                setRawData(response.data || {}); 
                
            } catch (err) {
                console.error("Error cargando datos del gráfico de torta:", err);
                setError('Error al cargar datos del gráfico de torta.');
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [centroId, ano, mesInicio, mesFin]);

    // Prepara los datos para Chart.js
    const chartData = useMemo(() => {
        const labels = [
            'Recargo', 
            'Extras', 
            'Dominical', 
            'Bonificación', 
            'Incapacidad'
        ];
        
        // Mapea los valores de la única fila de resultados
        const data = [
            rawData.recaro_total || 0,
            rawData.extras_total || 0,
            rawData.dominical_total || 0,
            rawData.bonificacion_total || 0,
            rawData.incapacidad_total || 0,
        ];
        
        // Filtra las etiquetas y los datos que son cero para no mostrar slices vacías
        const filteredLabels = labels.filter((_, index) => data[index] > 0);
        const filteredData = data.filter(value => value > 0);
        
        // Verifica si hay algún dato positivo
        const hasData = filteredData.length > 0;
        
        if (!hasData) {
            setError("No hay valores de novedades positivos para el período seleccionado.");
            return { datasets: [] };
        }
        
        // Si hay datos, limpiamos el error
        setError(null); 

        return {
            labels: filteredLabels,
            datasets: [
                {
                    data: filteredData,
                    backgroundColor: NOVEDAD_COLORS, // Asignamos colores
                    borderColor: 'white',
                    borderWidth: 2,
                },
            ],
        };
    }, [rawData]);


    return (
        // El contenedor ahora usa altura 100% para llenar el grafico-container
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {loading && <p>Cargando gráfico...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && chartData.datasets.length > 0 ? (
                // Renderiza Pie Chart
                <Pie options={options} data={chartData} /> 
            ) : (
                !loading && !error && <p>No hay datos o el período es inválido.</p>
            )}
        </div>
    );
};

export default GraficoTortaNovedades;