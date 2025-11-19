import './Facturacion.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
// Importamos el componente de gráfico
import GraficoUtilidad from '../components/GraficoUtilidad'; 

function Facturacion() {
    // --- Estados Originales ---
    const [documentos, setDocumentos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [usuario, setUsuario] = useState(null);

    // --- NUEVOS ESTADOS PARA FILTROS ---
    const [centros, setCentros] = useState([]); 
    const [selectedCentro, setSelectedCentro] = useState('');
    const [selectedAno, setSelectedAno] = useState(new Date().getFullYear());
    const [selectedMes, setSelectedMes] = useState(''); 

    const esAdmin = usuario && usuario.rol === 'Administracion';
    const documentosVisibles = documentos.filter(doc => {
        const docEsParaAdmin = doc.id_rol === 1;
        return esAdmin || !docEsParaAdmin;
    });

    // --- FUNCIONES Y ARRAYS PARA FILTROS ---
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

    // --- EFECTO 1: Cargar Usuario y Documentos (Tu código original) ---
    useEffect(() => {
        const usuarioString = localStorage.getItem('user');
        if (usuarioString) {
            setUsuario(JSON.parse(usuarioString));
        }

        const fetchDocuments = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setCargando(false);
                    return;
                }
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await axios.get(`${apiUrl}/api/documentos?id_pagina=4`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDocumentos(response.data);
            } catch (error) {
                console.error("Error al obtener documentos de planeación:", error);
                Swal.fire('Error', 'No se pudieron cargar los documentos.', 'error');
            } finally {
                setCargando(false);
            }
        };

        fetchDocuments();
    }, []);
    
    // --- EFECTO 2: Cargar la lista de Centros ---
    useEffect(() => {
        const fetchCentros = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const apiUrl = import.meta.env.VITE_API_URL;

                // NOTA: Si tu ruta es /api/centros, y tu app principal usa /api, tu montaje en Express debería ser: app.use('/api', router);
                // Si la ruta es /api/graficos/centros, entonces el montaje en Express es: app.use('/api/graficos', router);
                const { data } = await axios.get(
                    `${apiUrl}/api/graficos/centros`, 
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                
                if (Array.isArray(data)) {
                    setCentros(data);
                    if (data.length > 0) {
                        // Seleccionar el primer centro (id) por defecto
                        setSelectedCentro(data[0].id);
                    }
                }
            } catch (err) {
                console.error("Error cargando centros en Facturacion:", err);
            }
        };
        fetchCentros();
    }, []); 

    // --- Renderizado ---
    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
            <h1>Facturación</h1>

            {/* --- SECCIÓN DE FILTROS --- */}
            {/* Usamos la clase 'filter-container' del CSS */}
            <div className="filter-container">
                
                {/* Filtro de Centros */}
                <div className="filter-group">
                    <label className="filter-label" htmlFor="select-centro">Centro:</label>
                    <select 
                        id="select-centro"
                        className="filter-input"
                        value={selectedCentro} 
                        onChange={(e) => setSelectedCentro(e.target.value)}
                    >
                        <option value="">Centro</option>
                        {Array.isArray(centros) && centros.map(centro => (
                            <option key={centro.id} value={centro.id}>{centro.nombre}</option> 
                        ))}
                    </select>
                </div>

                {/* Filtro de Año */}
                <div className="filter-group">
                    <label className="filter-label" htmlFor="select-ano">Año:</label>
                    <select 
                        id="select-ano"
                        className="filter-input"
                        value={selectedAno} 
                        onChange={(e) => setSelectedAno(e.target.value)}
                    >
                        {getAnos().map(ano => (
                            <option key={ano} value={ano}>{ano}</option>
                        ))}
                    </select>
                </div>
                
                {/* Filtro de Mes */}
                <div className="filter-group">
                    <label className="filter-label" htmlFor="select-mes">Mes:</label>
                    <select 
                        id="select-mes"
                        className="filter-input"
                        value={selectedMes} 
                        onChange={(e) => setSelectedMes(e.target.value)}
                    >
                        {meses.map(mes => (
                            <option key={mes.valor} value={mes.valor}>{mes.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- SECCIÓN DEL GRÁFICO --- */}
            {/* Usamos la clase 'grafico-container' del CSS */}
            <div className="grafico-container">
                <h2>Análisis de Utilidad Mensual</h2>
                {/* PASAMOS LOS ESTADOS COMO PROPS AL HIJO */}
                <GraficoUtilidad 
                    centroId={selectedCentro}
                    ano={selectedAno}
                    mes={selectedMes}
                />
            </div>

            {/* --- SECCIÓN DE DOCUMENTOS ---
            {cargando ? (
                <p>Cargando documentos...</p>
            ) : (
                <div className="documentos-container">
                    <h2>Documentos Relacionados</h2>
                    <div className="documentos-grid">
                        {documentosVisibles.length > 0 ? (
                            documentosVisibles.map(doc => (
                                <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="indicadores-links">
                                    <p>{doc.nombre}</p>
                                </a>
                            ))
                        ) : (
                            <p>No hay documentos disponibles para tu rol en esta sección.</p>
                        )}
                    </div>
                </div>
            )} */}
        </div>
    );
}

export default Facturacion;