import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import UserTable from "../components/UserTable.jsx"; 
import './CreateUser.css';

function CreateUser() {
    const [nombre, setNombre] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [id_rol, setIdRol] = useState('');
    const [cargando, setCargando] = useState(false);
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.get(`${apiUrl}/api/usuarios`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            Swal.fire('Error', 'No se pudieron cargar los usuarios.', 'error');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!nombre || !contraseña || !id_rol) { Swal.fire('Campos incompletos', 'Por favor, rellena todos los campos.', 'error'); return; }
        setCargando(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL;
            await axios.post(`${apiUrl}/api/usuarios/register`, { nombre, contraseña, id_rol: parseInt(id_rol) }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Swal.fire('¡Usuario Creado!', `El usuario '${nombre}' ha sido registrado.`, 'success');
            setNombre(''); setContraseña(''); setIdRol('');
            fetchUsers();
        } catch (err) {
            let msg = err.response?.data?.error || "Ocurrió un error al crear el usuario.";
            Swal.fire('Error', msg, 'error');
        } 
        finally { setCargando(false); }
    };

    const handleDelete = async (userId, nombreUsuario) => {
        // Usamos SweetAlert para confirmar, ya que borrar es una acción destructiva
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Esta acción no se puede revertir. Se eliminará al usuario '${nombreUsuario}'.`,
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

                await axios.delete(`${apiUrl}/api/usuarios/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire(
                    '¡Eliminado!',
                    'El usuario ha sido eliminado.',
                    'success'
                );

                // Refrescamos la lista de usuarios para que la tabla se actualice
                fetchUsers();

            } catch (error) {
                console.error("Error al eliminar usuario:", error);
                Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
            }
        }
    }

    const handleEdit = async (usuarioAEditar) => {
        const { value: formValues } = await Swal.fire({
            title: `Editar Usuario: ${usuarioAEditar.nombre}`,
            html: `
                <input id="swal-nombre" class="swal2-input" value="${usuarioAEditar.nombre}">
                <select id="swal-rol" class="swal2-input">
                    <option value="1" ${usuarioAEditar.id_rol === 1 ? 'selected' : ''}>Administrador</option>
                    <option value="2" ${usuarioAEditar.id_rol === 2 ? 'selected' : ''}>Operario</option>
                </select>
            `,
            focusConfirm: false,
            preConfirm: () => {
                return {
                    nombre: document.getElementById('swal-nombre').value,
                    id_rol: parseInt(document.getElementById('swal-rol').value)
                }
            }
        });

        if (formValues) {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL;

                await axios.put(`${apiUrl}/api/usuarios/${usuarioAEditar.id}`, formValues, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire('¡Actualizado!', 'Los datos del usuario han sido actualizados.', 'success');
                fetchUsers(); // Refrescamos la tabla

            } catch (error) {
                console.error("Error al actualizar usuario:", error);
                Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error');
            }
        }
    };


    return (
            <>
                <form className="form-create-user" onSubmit={handleCreateUser}>
                    <h1>Crear Nuevo Usuario</h1>
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre de usuario</label>
                        <input type="text" id="nombre" placeholder="Escribe el nombre de usuario" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" id="password" placeholder="Escribe una contraseña temporal" value={contraseña} onChange={(e) => setContraseña(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="rol">Rol de usuario</label>
                        <select id="rol" value={id_rol} onChange={(e) => setIdRol(e.target.value)}>
                            <option value="" disabled>Selecciona un rol...</option>
                            <option value="1">Administrador</option>
                            <option value="2">Operario</option>
                        </select>
                    </div>
                    <button type="submit" className="submit-btn" disabled={cargando}>
                        {cargando ? 'Creando...' : 'Crear Usuario'}
                    </button>
                </form>
                
                <UserTable usuarios={usuarios} onBorrar={handleDelete} onEditar={handleEdit} />
            </>
    );
}

export default CreateUser;