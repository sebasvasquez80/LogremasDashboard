import './Planeacion.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function Planeacion() {
    const [documentos, setDocumentos] = useState([]);
    const [cargando, setCargando] = useState(true);
    // 1. Creamos un estado para guardar la información del usuario logueado
    const [usuario, setUsuario] = useState(null);

    const esAdmin = usuario && usuario.rol === 'admin';
    
    // Creamos una nueva lista solo con los documentos visibles
    const documentosVisibles = documentos.filter(doc => {
        const docEsParaAdmin = doc.id_rol === 1;
        // La condición para mostrar un documento es:
        // 1. Si el usuario es admin, O
        // 2. Si el documento NO es exclusivo para admins.
        return esAdmin || !docEsParaAdmin;
    });

    useEffect(() => {
        // 2. Leemos los datos del usuario desde el localStorage
        const usuarioString = localStorage.getItem('user');
        if (usuarioString) {
            setUsuario(JSON.parse(usuarioString));
        }

        const fetchDocuments = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    // Si no hay token, no hacemos la petición.
                    // El usuario será redirigido o no verá nada.
                    setCargando(false);
                    return;
                }
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await axios.get(`${apiUrl}/api/documentos?page_id=1`, {
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

    return ( 
            <>
                <h1>Planeación</h1>
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

export default Planeacion;