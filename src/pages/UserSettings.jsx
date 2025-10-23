
import './UserSettings.css';
import { useState, useEffect } from 'react'; 
import { useNavigate } from "react-router-dom";

function UserSettings() {

    const navigate = useNavigate();

    const rutaCreateUser = () => {
        navigate('/createuser');
    }

    const rutaCrearDocumento = () => {
        navigate('/creardocumento');
    }

    const rutaCambiarContrasena = () => {
        navigate('/cambiarcontrasena');
    }

    const [user, setUser] = useState(null);

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (!userString) {
            console.warn("Usuario no encontrado en localStorage.");
            return; 
        }
        try {
            const userData = JSON.parse(userString);
                    console.log("Datos del usuario cargados desde localStorage:", userData);

            setUser(userData);
        } catch (error) {
            console.error("Error al parsear datos de usuario:", error);
        }
    }, []);

    
    return (
            <>
                <h1>Opciones de Usuario</h1>

                {user && user.rol.toLowerCase().trim() === 'admin' && (
                    <>
                        <p>Herramientas de Administrador</p>
                        <div className="action-buttons">
                            <button onClick={rutaCreateUser} className="create-user">Crear Nuevo Usuario</button> 
                            <button onClick={rutaCrearDocumento} className="create-document">Crear Nuevo Documento</button>
                        </div>
                    </>
                )}
                
                <p className="section-title" >Opciones Generales</p>
                <div className="action-buttons">
                    <button className="change-password" onClick={rutaCambiarContrasena}>Cambiar Contraseña</button>
                </div>
            </>
    );
}

export default UserSettings;