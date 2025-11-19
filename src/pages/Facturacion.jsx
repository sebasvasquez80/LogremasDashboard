import './Facturacion.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
// Importamos el componente de gráfico
import GraficoUtilidad from '../components/GraficoUtilidad';
import GraficoPersonas from '../components/GraficoPersonas';
import GraficoFacturacion from '../components/GraficoFacturacion';
import GraficoNomina from '../components/GraficoNomina';
import GraficoGastos from '../components/GraficoGastos';

function Facturacion() {
    // --- Estados Originales ---
    const [documentos, setDocumentos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [usuario, setUsuario] = useState(null);

    // --- NUEVOS ESTADOS PARA FILTROS DE RANGO ---
    const [contratos, setContratos] = useState([]); // Nueva lista de contratos
    const [selectedContrato, setSelectedContrato] = useState(''); // Nuevo estado de filtro
    const [centros, setCentros] = useState([]);
    const [selectedCentro, setSelectedCentro] = useState('');
    const [selectedAno, setSelectedAno] = useState(new Date().getFullYear());
    // CAMBIO: Ahora son dos estados, inicializados en Enero (1) y Diciembre (12)
    const [selectedMesInicio, setSelectedMesInicio] = useState('1');
    const [selectedMesFin, setSelectedMesFin] = useState('12');

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

    useEffect(() => {
        const fetchContratos = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const apiUrl = import.meta.env.VITE_API_URL;
                const { data } = await axios.get(
                    `${apiUrl}/api/graficos/contratos`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (Array.isArray(data)) {
                    setContratos(data);
                    // No seleccionamos un contrato por defecto
                }
            } catch (err) {
                console.error("Error cargando contratos en Facturacion:", err);
            }
        };
        fetchContratos();
    }, []);
    // --- EFECTO 3: Cargar la lista de Centros ---
    useEffect(() => {
        const fetchCentros = async () => {
            setCentros([]); // Limpiar centros al cambiar contrato
            setSelectedCentro(''); // Restablecer centro seleccionado

            // Si no hay contrato seleccionado, no cargamos nada más que la lista vacía
            if (!selectedContrato) return; 

            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const apiUrl = import.meta.env.VITE_API_URL;
                const params = { contratoId: selectedContrato };

                const { data } = await axios.get(
                    `${apiUrl}/api/graficos/centros`, 
                    {
                        params: params, // Enviamos el filtro del contrato
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                
                if (Array.isArray(data)) {
                    setCentros(data);
                    // No seleccionamos un centro por defecto, forzamos la selección manual
                }
            } catch (err) {
                console.error("Error cargando centros en Facturacion:", err);
            }
        };
        fetchCentros();
    }, [selectedContrato]); // Se re-ejecuta cada vez que el contrato cambia

    // --- Renderizado ---
    return (
        // Añadí un padding al contenedor principal para que no se pegue a los bordes
        <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
            <h1>Facturación</h1>

            {/* --- SECCIÓN DE FILTROS --- */}
            <div className="filter-container">

                <div className="filter-group">
                    <label className="filter-label" htmlFor="select-contrato">Empresa (Contrato):</label>
                    <select 
                        id="select-contrato"
                        className="filter-input"
                        value={selectedContrato} 
                        onChange={(e) => {
                            setSelectedContrato(e.target.value);
                            setSelectedCentro(''); // Limpiar centro al cambiar contrato
                        }}
                    >
                        <option value="">Elegir Contrato</option>
                        {Array.isArray(contratos) && contratos.map(contrato => (
                            <option key={contrato.id} value={contrato.id}>{contrato.nombre}</option> 
                        ))}
                    </select>
                </div>

                {/* Filtro de Centros */}
                <div className="filter-group">
                    <label className="filter-label" htmlFor="select-centro">Centro:</label>
                    <select 
                        id="select-centro"
                        className="filter-input"
                        value={selectedCentro} 
                        onChange={(e) => setSelectedCentro(e.target.value)}
                        // Deshabilitar si no hay un contrato seleccionado
                        disabled={!selectedContrato || centros.length === 0}
                    >
                        <option value="">
                            {selectedContrato ? 'Elegir centro' : 'Seleccione Contrato primero'}
                        </option> 
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

                {/* Filtro de Mes INICIO */}
                <div className="filter-group">
                    <label className="filter-label" htmlFor="select-mes-inicio">Desde Mes:</label>
                    <select
                        id="select-mes-inicio"
                        className="filter-input"
                        value={selectedMesInicio}
                        onChange={(e) => setSelectedMesInicio(e.target.value)}
                    >
                        {meses.map(mes => (
                            // El valor es el número del mes (1 a 12)
                            <option key={`inicio-${mes.valor}`} value={mes.valor}>{mes.nombre}</option>
                        ))}
                    </select>
                </div>

                {/* Filtro de Mes FIN */}
                <div className="filter-group">
                    <label className="filter-label" htmlFor="select-mes-fin">Hasta Mes:</label>
                    <select
                        id="select-mes-fin"
                        className="filter-input"
                        value={selectedMesFin}
                        onChange={(e) => setSelectedMesFin(e.target.value)}
                    >
                        {meses.map(mes => (
                            // El valor es el número del mes (1 a 12)
                            <option key={`fin-${mes.valor}`} value={mes.valor}>{mes.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- SECCIÓN DEL GRÁFICO --- */}
            <div className="grafico-container">
                <h2>Análisis de Utilidad Mensual</h2>
                {/* PASAMOS LOS ESTADOS DE RANGO COMO PROPS */}
                <GraficoUtilidad
                    centroId={selectedCentro}
                    ano={selectedAno}
                    mesInicio={selectedMesInicio}
                    mesFin={selectedMesFin}
                />
            </div>

            {/* Gráfico 2: Personas (NUEVO) */}
            <div className="grafico-container">
                <h2>Cantidad de Personas</h2>
                <GraficoPersonas
                    centroId={selectedCentro}
                    ano={selectedAno}
                    mesInicio={selectedMesInicio}
                    mesFin={selectedMesFin}
                />
            </div>

            {/* Gráfico 1: Facturación (NUEVO) */}
            <div className="grafico-container">
                <h2>Facturación Mensual</h2>
                <GraficoFacturacion
                    centroId={selectedCentro}
                    ano={selectedAno}
                    mesInicio={selectedMesInicio}
                    mesFin={selectedMesFin}
                />
            </div>

            {/* Gráfico 2: Nómina (NUEVO) */}
            <div className="grafico-container">
                <h2>Costo de Nómina Mensual</h2>
                <GraficoNomina
                    centroId={selectedCentro}
                    ano={selectedAno}
                    mesInicio={selectedMesInicio}
                    mesFin={selectedMesFin}
                />
            </div>


            {/* Gráfico 2: Gastos (NUEVO) */}
            <div className="grafico-container">
                <h2>Composición de Gastos</h2>
                <GraficoGastos
                    centroId={selectedCentro}
                    ano={selectedAno}
                    mesInicio={selectedMesInicio}
                    mesFin={selectedMesFin}
                />
            </div>


            {/* --- SECCIÓN DE DOCUMENTOS (Tu código original) ---
            {cargando ? (
                <p>Cargando documentos...</p>
            ) : (
                <div className="documentos-container">
                    <h2>Documentos Relacionados</h2>
                    <div className="documentos-grid">
                        {documentosVisibles.length > 0 ? (
                            documentosVisibles.map(doc => (
                                <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="gestion-links">
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