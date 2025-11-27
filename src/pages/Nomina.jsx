import './Nomina.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

// Importamos el componente del gráfico de Nómina
import GraficoSalarioTransporte from '../components/GraficoSalarioTransporte'; 
import GraficoNovedades from '../components/GraficoNovedades';

function Nomina() {
    // --- Estados para Documentos y Usuario (Mantenidos) ---
    const [documentos, setDocumentos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [usuario, setUsuario] = useState(null);

    // --- ESTADOS PARA FILTROS DE NÓMINA (NUEVOS) ---
    const [contratos, setContratos] = useState([]); 
    const [selectedContrato, setSelectedContrato] = useState(''); 
    // Usamos 'centrosNomina' para distinguirlos de los centros de Facturación
    const [centrosNomina, setCentrosNomina] = useState([]); 
    const [selectedCentroNomina, setSelectedCentroNomina] = useState(''); // ID del centro_nomina
    
    const [selectedAno, setSelectedAno] = useState(new Date().getFullYear());
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

    // --- EFECTO 1: Cargar Usuario y Documentos ---
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
                // Usamos id_pagina=1 como en tu código original
                const response = await axios.get(`${apiUrl}/api/documentos?id_pagina=1`, { 
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDocumentos(response.data);
            } catch (error) {
                console.error("Error al obtener documentos de nómina:", error);
                Swal.fire('Error', 'No se pudieron cargar los documentos.', 'error');
            } finally {
                setCargando(false);
            }
        };

        fetchDocuments();
    }, []);

    // --- EFECTO 2: Cargar la lista de Contratos (Compartido con Facturación) ---
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
                }
            } catch (err) {
                console.error("Error cargando contratos en Nomina:", err);
            }
        };
        fetchContratos();
    }, []); 

    // --- EFECTO 3: Cargar Centros de Nómina (Depende del Contrato) ---
    useEffect(() => {
        const fetchCentrosNomina = async () => {
            setCentrosNomina([]); // Limpiar centros al cambiar contrato
            setSelectedCentroNomina(''); // Restablecer centro seleccionado

            // Si no hay contrato seleccionado, no cargamos nada
            if (!selectedContrato) return; 

            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const apiUrl = import.meta.env.VITE_API_URL;
                const params = { contratoId: selectedContrato };

                // Llamada al nuevo endpoint de Centros de Nómina
                const { data } = await axios.get(
                    `${apiUrl}/api/graficos/centros-nomina`, 
                    {
                        params: params, // Filtro por Contrato
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                
                if (Array.isArray(data)) {
                    setCentrosNomina(data);
                }
            } catch (err) {
                console.error("Error cargando centros de nómina:", err);
            }
        };
        fetchCentrosNomina();
    }, [selectedContrato]); // Se re-ejecuta cada vez que el contrato cambia

    return ( 
        <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
            <h1>Informes de Nómina</h1>

            {/* --- SECCIÓN DE FILTROS --- */}
            <div className="filter-container">
                
                {/* Filtro 1: Contrato (Empresa) */}
                <div className="filter-group">
                    <label className="filter-label" htmlFor="select-contrato">Empresa (Contrato):</label>
                    <select 
                        id="select-contrato"
                        className="filter-input"
                        value={selectedContrato} 
                        onChange={(e) => {
                            setSelectedContrato(e.target.value);
                            setSelectedCentroNomina(''); // Limpiar centro al cambiar contrato
                        }}
                    >
                        <option value="">Elegir Contrato</option>
                        {Array.isArray(contratos) && contratos.map(contrato => (
                            <option key={contrato.id} value={contrato.id}>{contrato.nombre}</option> 
                        ))}
                    </select>
                </div>
                
                {/* Filtro 2: Centro de Nómina (DEPENDIENTE) */}
                <div className="filter-group">
                    <label className="filter-label" htmlFor="select-centro-nomina">Centro de Nómina:</label>
                    <select 
                        id="select-centro-nomina"
                        className="filter-input"
                        value={selectedCentroNomina} 
                        onChange={(e) => setSelectedCentroNomina(e.target.value)}
                        disabled={!selectedContrato || centrosNomina.length === 0}
                    >
                        <option value="">
                            {selectedContrato ? 'Elegir centro' : 'Seleccione Contrato primero'}
                        </option> 
                        {Array.isArray(centrosNomina) && centrosNomina.map(centro => (
                            // Usamos centro.id como valor
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
                            <option key={`fin-${mes.valor}`} value={mes.valor}>{mes.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- SECCIÓN DE GRÁFICOS --- */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px', marginBottom: '40px' }}>
                
                <div className="grafico-container">
                    <h2>Reporte salarial</h2>
                    <GraficoSalarioTransporte 
                        centroId={selectedCentroNomina} // Usamos el ID del Centro de Nómina
                        ano={selectedAno}
                        mesInicio={selectedMesInicio}
                        mesFin={selectedMesFin}
                    />
                </div>

                <div className="grafico-container">
                    <h2>Reporte novedades</h2>
                    <GraficoNovedades
                        centroId={selectedCentroNomina} // Usamos el ID del Centro de Nómina
                        ano={selectedAno}
                        mesInicio={selectedMesInicio}
                        mesFin={selectedMesFin}
                    />
                </div>
            </div>

            {/* --- SECCIÓN DE DOCUMENTOS (Implementación completa) ---
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
    )
}

export default Nomina;