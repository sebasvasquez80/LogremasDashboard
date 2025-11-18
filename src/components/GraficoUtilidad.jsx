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

// --- Componente Principal ---
const GraficoUtilidad = () => {

    // --- Estados ---
    const [chartData, setChartData] = useState({ datasets: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estados para los filtros
    const [centros, setCentros] = useState([]); // Almacena la lista de centros
    const [selectedCentro, setSelectedCentro] = useState('');
    const [selectedAno, setSelectedAno] = useState(new Date().getFullYear()); // Año actual por defecto
    const [selectedMes, setSelectedMes] = useState(''); // '' significa "Todos los meses"

    // --- Efectos (Hooks) ---

    // Efecto 1: Cargar la lista de centros (CORREGIDO CON TOKEN y VITE_API_URL)
    useEffect(() => {
        const fetchCentros = async () => {
            try {
                // 1. Obtenemos el token de localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("Usuario no autenticado.");
                    return;
                }

                // 2. Obtenemos la URL del backend
                const apiUrl = import.meta.env.VITE_API_URL;

                // 3. Hacemos la llamada ENVIANDO EL TOKEN y usando la URL completa
                const { data } = await axios.get(
                    `${apiUrl}/api/centros`, // <--- RUTA COMPLETA
                    {
                        headers: { Authorization: `Bearer ${token}` } // <--- TOKEN
                    }
                );
                
                setCentros(data);
                
                // Opcional: seleccionar el primer centro por defecto
                if (data && data.length > 0) {
                    setSelectedCentro(data[0].id);
                }
            } catch (err) {
                console.error("Error cargando centros:", err);
                setError("No se pudieron cargar los centros.");
            }
        };
        fetchCentros();
    }, []); // El array vacío [] significa que solo se ejecuta 1 vez al inicio

    // Efecto 2: Cargar los datos del gráfico (CORREGIDO CON TOKEN y VITE_API_URL)
    useEffect(() => {
        if (!selectedCentro || !selectedAno) {
            setChartData({ datasets: [] }); // Limpia el gráfico
            return;
        }

        const fetchChartData = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Obtenemos el token (necesario para cada llamada)
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("Usuario no autenticado.");
                    setLoading(false);
                    return;
                }

                // 2. Obtenemos la URL del backend
                const apiUrl = import.meta.env.VITE_API_URL;

                // Construimos los parámetros de la URL
                const params = {
                    centroId: selectedCentro,
                    ano: selectedAno,
                };
                if (selectedMes) {
                    params.mes = selectedMes;
                }

                // 3. Hacemos la llamada ENVIANDO EL TOKEN y usando la URL completa
                const { data } = await axios.get(
                    `${apiUrl}/api/graficos/utilidad`, // <--- RUTA COMPLETA
                    { 
                        params: params, // Los filtros van como parámetros
                        headers: { Authorization: `Bearer ${token}` } // <--- TOKEN
                    }
                ); 

                setChartData(data);

            } catch (err) {
                console.error("Error cargando datos del gráfico:", err);
                setError(err.message || 'Error al cargar datos del gráfico');
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [selectedCentro, selectedAno, selectedMes]); // Dependencias: se re-ejecuta si cambian

    // --- Opciones y Arrays para Filtros ---

    const getAnos = () => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => currentYear - i);
    };

    const meses = [
        { valor: '', nombre: 'Todos los Meses' },
        { valor: 1, nombre: 'Enero' }, { valor: 2, nombre: 'Febrero' },
        { valor: 3, nombre: 'Marzo' }, { valor: 4, nombre: 'Abril' },
        { valor: 5, nombre: 'Mayo' }, { valor: 6, nombre: 'Junio' },
        { valor: 7, nombre: 'Julio' }, { valor: 8, nombre: 'Agosto' },
        { valor: 9, nombre: 'Septiembre' }, { valor: 10, nombre: 'Octubre' },
        { valor: 11, nombre: 'Noviembre' }, { valor: 12, nombre: 'Diciembre' }
    ];

    // Opciones de Chart.js para formatear los porcentajes
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: `Utilidad Mensual (${selectedAno})` },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed.y !== null) {
                            label += (context.parsed.y * 100).toFixed(2) + ' %';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value) {
                        return (value * 100).toFixed(0) + ' %';
                    }
                }
            }
        }
    };

    // --- Renderizado (JSX) ---
    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
            <h2>Gráfico de Utilidad</h2>

            {/* --- SECCIÓN DE FILTROS --- */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <select value={selectedCentro} onChange={(e) => setSelectedCentro(e.target.value)}>
                    <option value="">Seleccione un Centro</option>
                    {Array.isArray(centros) && centros.map(centro => (
                        <option key={centro.id} value={centro.id}>{centro.nombre}</option>
                    ))}
                </select>

                <select value={selectedAno} onChange={(e) => setSelectedAno(e.target.value)}>
                    {getAnos().map(ano => (
                        <option key={ano} value={ano}>{ano}</option>
                    ))}
                </select>

                <select value={selectedMes} onChange={(e) => setSelectedMes(e.target.value)}>
                    {meses.map(mes => (
                        <option key={mes.valor} value={mes.valor}>{mes.nombre}</option>
                    ))}
                </select>
            </div>

            {/* --- SECCIÓN DEL GRÁFICO --- */}
            <div style={{ height: '400px', position: 'relative' }}>
                {loading && <p>Cargando gráfico...</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                {!loading && !error && chartData.datasets.length > 0 ? (
                    <Line options={options} data={chartData} />
                ) : (
                    !loading && <p>Por favor, seleccione un centro y un año para ver los datos.</p>
                )}
            </div>
        </div>
    );
};

export default GraficoUtilidad;