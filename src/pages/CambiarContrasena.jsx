import './CambiarContrasena.css';
import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function CambiarContrasena() {

    const [contraseñaActual, setContraseñaActual] = useState('');
    const [nuevaContraseña, setNuevaContraseña] = useState('');
    const [confirmarContraseña, setConfirmarContraseña] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend validation
        if (!contraseñaActual || !nuevaContraseña || !confirmarContraseña) {
            Swal.fire('Error', 'Por favor, rellena todos los campos.', 'error');
            return;
        }
        if (nuevaContraseña !== confirmarContraseña) {
            Swal.fire('Error', 'Las nuevas contraseñas no coinciden.', 'error');
            return;
        }
        if (nuevaContraseña.length < 6) {
             Swal.fire('Error', 'La nueva contraseña debe tener al menos 6 caracteres.', 'error');
             return;
        }

        setCargando(true);

        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL;
            
            await axios.put(`${apiUrl}/api/usuarios/change-password`, 
                { contraseñaActual, nuevaContraseña }, // Send current and new password
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire('¡Éxito!', 'Tu contraseña ha sido actualizada.', 'success');
            // Clear the form
            setContraseñaActual('');
            setNuevaContraseña('');
            setConfirmarContraseña('');

        } catch (error) {
            console.error("Error al cambiar contraseña:", error);
            const message = error.response?.data?.error || 'No se pudo actualizar la contraseña. Intenta de nuevo.';
            Swal.fire('Error', message, 'error');
        } finally {
            setCargando(false);
        }
    };

    return (
        <> 
            <h1>Cambiar Contraseña</h1>
            <form className="form-change-password" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="currentPassword">Contraseña Actual</label>
                    <input
                        type="password"
                        id="currentPassword"
                        value={contraseñaActual}
                        onChange={(e) => setContraseñaActual(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="newPassword">Nueva Contraseña</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={nuevaContraseña}
                        onChange={(e) => setNuevaContraseña(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmarContraseña}
                        onChange={(e) => setConfirmarContraseña(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="submit-btn" disabled={cargando}>
                    {cargando ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
            </form>
        </>

    )

}

export default CambiarContrasena;