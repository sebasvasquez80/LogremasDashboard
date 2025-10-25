import './Indicadores.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function Indicadores (){
    const [documentos, setDocumentos] = useState([]); 
    const [cargando, setCargando] = useState(true); 
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const usuarioString = localStorage.getItem('user');
        if (usuarioString) {
            // Guardamos el objeto usuario completo
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
                // Pide documentos de la página 'Indicadores' (id_pagina=2)
                // El backend ya filtra por rol y subregión según el token
                const response = await axios.get(`${apiUrl}/api/documentos?id_pagina=2`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDocumentos(response.data);
            } catch (error) {
                console.error("Error al obtener documentos de indicadores:", error);
                Swal.fire('Error', 'No se pudieron cargar los documentos.', 'error');
            } finally {
                setCargando(false);
            }
        };

        fetchDocuments();
    }, []);

    // --- LÓGICA DE FILTRADO MEJORADA ---
    const documentosVisibles = documentos.filter(doc => {
        // Si no hemos cargado el usuario aún, no mostramos nada
        if (!usuario) return false; 

        const userRolId = usuario.id_rol; // El ID del rol del usuario logueado
        const docRolId = doc.id_rol;     // El ID del rol para el que es el documento

        // Regla 1: Administracion (ID 1) ve todo lo que llega del backend
        if (userRolId === 1 || userRolId === 4) {
            return true; 
        }
        
        // Regla 2: Coordinacion (ID 2) y Desarrollo (ID 4) ven todo EXCEPTO lo de Admin (ID 1)
        if (userRolId === 2) {
            return docRolId !== 1; // Muestra si el documento NO es para Admin
        }

        // Regla 3: Lideracion (ID 3) ve SOLO lo de Lideracion (ID 3)
        if (userRolId === 3) {
            return docRolId === 3; // Muestra SOLO si el documento es para Lideracion
        }

        // Por defecto (si hay otros roles), no muestra nada
        return false; 
    });

    return(
        
            
            <>
                 <h1>Indicadores</h1>
                {cargando ? (
                    <p>Cargando documentos...</p>
                ) : (
                    <div className="documentos-grid">
                        {/* Ahora hacemos el .map() sobre la lista YA FILTRADA */}
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
            </>
    )
}

export default Indicadores;