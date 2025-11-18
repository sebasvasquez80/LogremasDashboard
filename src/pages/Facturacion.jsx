import './Facturacion.css'
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

// 1. --- IMPORTA EL GRÁFICO ---
// (Asegúrate de que la ruta sea correcta según donde guardaste el archivo)
import GraficoUtilidad from '../components/GraficoUtilidad';

function Facturacion(){

    // --- Estados para Documentos (Tu código original) ---
    const [documentos, setDocumentos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [usuario, setUsuario] = useState(null);

    const esAdmin = usuario && usuario.rol === 'Administracion';

    const documentosVisibles = documentos.filter(doc => {
        const docEsParaAdmin = doc.id_rol === 1;
        return esAdmin || !docEsParaAdmin;
    });

    // --- Efecto para Documentos (Tu código original) ---
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

    // --- Renderizado ---
    return(
        <>
            <h1>Facturación</h1>
            
            {/* --- 2. SECCIÓN DEL GRÁFICO (NUEVO) --- */}
            {/* * Simplemente llamamos al componente.
              * Ya incluye sus propios filtros (centro, mes, año)
              * y su propia lógica para llamar al backend.
            */}
            <div className="grafico-container" style={{ marginBottom: '40px' }}>
                <h2>Análisis de Utilidad</h2>
                <GraficoUtilidad />
            </div>

            {/* --- 3. SECCIÓN DE DOCUMENTOS (Tu código original) --- */}
            <div className="documentos-container">
                <h2>Documentos Relacionados</h2>
                {cargando ? (
                    <p>Cargando documentos...</p>
                ) : (
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
                )}
            </div>
        </>  
    )
}

export default Facturacion;