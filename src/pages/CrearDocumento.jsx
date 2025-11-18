import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './CrearDocumento.css';
import TablaDocumento from "../components/TablaDocumento.jsx";


function CrearDocumento() {
    // Estados para los campos del formulario
    const [nombre, setNombre] = useState('');
    const [url, setUrl] = useState('');
    const [id_rol, setIdRol] = useState('');
    const [id_pagina, setIdPagina] = useState('');
    const [id_subregion, setIdSubregion] = useState('');

    // Estados para la lógica del componente
    const [cargando, setCargando] = useState(false);
    const [documentos, setDocumentos] = useState([]);

    // Obtener documentos del backend al cargar el componente
    useEffect(() => {
        fetchDocuments();
    }, []);

    // Función para obtener los documentos
    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.get(`${apiUrl}/api/documentos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocumentos(response.data);
        } catch (error) {
            console.error("Error al obtener documentos:", error);
            Swal.fire('Error', 'No se pudieron cargar los documentos.', 'error');
        }
    };

    // Manejar el envío del formulario para crear un nuevo documento
    const handleCreateDocument = async (e) => {
        e.preventDefault();
        if (!nombre || !url || !id_subregion || !id_rol || !id_pagina) {
            Swal.fire('Campos incompletos', 'Por favor, rellena todos los campos.', 'error');
            return;
        }
        setCargando(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL;
            const newDocumentData = {
                nombre,
                url,
                id_subregion: parseInt(id_subregion),
                id_rol: parseInt(id_rol),
                id_pagina: parseInt(id_pagina)
            };
            await axios.post(`${apiUrl}/api/documentos`, newDocumentData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Swal.fire('¡Documento creado!', `El documento '${nombre}' ha sido registrado.`, 'success');
            setNombre(''); setUrl(''); setIdSubregion(''); setIdRol(''); setIdPagina('');
            fetchDocuments(); // Refrescar la tabla
        } catch (err) {
            let msg = err.response?.data?.error || "Ocurrió un error al crear el documento.";
            Swal.fire('Error', msg, 'error');
        } finally {
            setCargando(false);
        }
    };

    // Manejar la eliminación de un documento
    const handleDelete = async (documentId, nombreDocumento) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará el documento '${nombreDocumento}'. Esta acción no se puede revertir.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, ¡bórralo!',
            cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL;
                await axios.delete(`${apiUrl}/api/documentos/${documentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('¡Eliminado!', 'El documento ha sido eliminado.', 'success');
                fetchDocuments(); // Refrescar la tabla
            } catch (error) {
                console.error("Error al eliminar documento:", error);
                Swal.fire('Error', 'No se pudo eliminar el documento.', 'error');
            }
        }
    };

    // Manejar la edición de un documento
    const handleEdit = async (documentoEditar) => {
        const { value: formValues } = await Swal.fire({
            title: `Editar Documento: ${documentoEditar.nombre}`,
            html: `
                <input id="swal-nombre" class="swal2-input" value="${documentoEditar.nombre}">
                <input id="swal-url" class="swal2-input" value="${documentoEditar.url}">
                <select id="swal-rol" class="swal2-input">
                    <option value="1" ${documentoEditar.id_rol === 1 ? 'selected' : ''}>Administrador</option>
                    <option value="2" ${documentoEditar.id_rol === 2 ? 'selected' : ''}>Coordinacion</option>
                    <option value="3" ${documentoEditar.id_rol === 3 ? 'selected' : ''}>Lideracion</option>
                    <option value="4" ${documentoEditar.id_rol === 4 ? 'selected' : ''}>Desarrollo</option>
                </select>
                <select id="swal-page" class="swal2-input">
                    <option value="1" ${documentoEditar.id_pagina === 1 ? 'selected' : ''}>Planeación</option>
                    <option value="2" ${documentoEditar.id_pagina === 2 ? 'selected' : ''}>Indicadores</option>
                    <option value="3" ${documentoEditar.id_pagina === 3 ? 'selected' : ''}>Gestión</option>
                    <option value="4" ${documentoEditar.id_pagina === 4 ? 'selected' : ''}>Facturación</option>
                </select>
                <select id="swal-subregion" class="swal2-input">
                    <option value="1" ${documentoEditar.id_subregion === 1 ? 'selected' : ''}>Sur Antioquia</option>
                    <option value="2" ${documentoEditar.id_subregion === 2 ? 'selected' : ''}>Norte Antioquia</option>
                    <option value="3" ${documentoEditar.id_subregion === 3 ? 'selected' : ''}>Occidente Cundinamarca</option>
                    <option value="4" ${documentoEditar.id_subregion === 4 ? 'selected' : ''}>Norte Cundinamarca</option>
                    <option value="5" ${documentoEditar.id_subregion === 5 ? 'selected' : ''}>Valle Atlantico</option>
                </select>
            `,
            focusConfirm: false,
            preConfirm: () => {
                return {
                    nombre: document.getElementById('swal-nombre').value,
                    url: document.getElementById('swal-url').value,
                    id_rol: parseInt(document.getElementById('swal-rol').value),
                    id_pagina: parseInt(document.getElementById('swal-page').value),
                    id_subregion: parseInt(document.getElementById('swal-subregion').value)
                }
            }
        });

        if (formValues) {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL;
                await axios.put(`${apiUrl}/api/documentos/${documentoEditar.id}`, formValues, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('¡Actualizado!', 'Los datos del documento han sido actualizados.', 'success');
                fetchDocuments(); // Refrescar la tabla
            } catch (error) {
                console.error("Error al actualizar documento:", error);
                Swal.fire('Error', 'No se pudo actualizar el documento.', 'error');
            }
        }
    };

    return (
        <>
            <form className="form-create-document" onSubmit={handleCreateDocument}>
                <h1>Crear Nuevo Documento</h1>
                <div className="form-group">
                    <label htmlFor="nombre">Nombre de documento</label>
                    <input type="text" id="nombre" placeholder="Escribe el nombre del documento" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="url">URL</label>
                    <input type="url" id="url" placeholder="Escribe el link del documento" value={url} onChange={(e) => setUrl(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="rol">Visible para Rol</label>
                    <select id="rol" value={id_rol} onChange={(e) => setIdRol(e.target.value)}>
                        <option value="" disabled>Selecciona un rol</option>
                        <option value="1">Administración</option>
                        <option value="2">Coordinación</option>
                        <option value="3">Lideración</option>
                        <option value="4">Desarrollo</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="grupo">Pestaña</label>
                    <select id="grupo" value={id_pagina} onChange={(e) => setIdPagina(e.target.value)}>
                        <option value="" disabled>Selecciona una pestaña</option>
                        <option value="1">Planeación</option>
                        <option value="2">Indicadores</option>
                        <option value="3">Gestión</option>
                        <option value="4">Facturación</option>
                    </select>
                </div>
                <div className="form-group">
                        <label htmlFor="subregion">Region del usuario</label>
                        <select id="subregion" value={id_subregion} onChange={(e) => setIdSubregion(e.target.value)}>
                            <option value="" disabled>Selecciona un rol...</option>
                            <option value="1">Sur Antioquia</option>
                            <option value="2">Norte Antioquia</option>
                            <option value="3">Occidente Cundinamarca</option>
                            <option value="4">Norte Cundinamarca</option>
                            <option value="5">Valle Atlantico</option>
                        </select>
                </div>
                <button type="submit" className="submit-btn" disabled={cargando}>
                    {cargando ? 'Creando...' : 'Crear Documento'}
                </button>
            </form>
            
            <TablaDocumento documentos={documentos} onBorrar={handleDelete} onEditar={handleEdit} />
        </>
    );
}

export default CrearDocumento;