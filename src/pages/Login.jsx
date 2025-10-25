import "./Login.css";
import imagenes from "../assets/imagenes";
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import axios from 'axios';

// 1. Importamos SweetAlert2 y sus estilos
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

function Login() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState('');
    const [contraseña, setContraseña] = useState('');
    // const [error, setError] = useState(''); // Ya no necesitamos este estado
    const [cargando, setCargando] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        // setError(''); // Ya no es necesario
        setCargando(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const loginUrl = `${apiUrl}/api/usuarios/login`;

            console.log("Intentando conectar a:", loginUrl);

            const response = await axios.post(loginUrl, {
                usuario: usuario,
                contraseña: contraseña
            });

            const { token, usuario: datosUsuario } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(datosUsuario));

            // 2. MOSTRAMOS LA ALERTA DE ÉXITO CON SWEETALERT
            await Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: 'Has iniciado sesión correctamente.',
                timer: 1500, // La alerta se cierra automáticamente después de 1.5 segundos
                showConfirmButton: false, // Ocultamos el botón de "OK"
            });

            // Después de que la alerta se cierre, redirigimos
            navigate('/home'); // Cambiado de '/formularioregistro' a '/home' que es más lógico

        } catch (err) {
            // 3. MOSTRAMOS LA ALERTA DE ERROR CON SWEETALERT
            let mensajeError = "No se pudo conectar con el servidor. Intenta más tarde.";
            if (err.response && err.response.data.error) {
                mensajeError = err.response.data.error;
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Oops... Algo salió mal',
                text: mensajeError,
            });

        } finally {
            setCargando(false);
        }
    };

    return (
        <div className='login-page'>
            <section className="login-container">
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="login-image">
                        <img className="logoCorona" src={imagenes.img1} alt="" />
                    </div>
                    <h2>Iniciar Sesión</h2>
                    <label htmlFor="usuario">Usuario</label>
                    <input
                        type="text"
                        id="usuario"
                        placeholder="Usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        required
                    />
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Ingresa tu contraseña"
                        value={contraseña}
                        onChange={(e) => setContraseña(e.target.value)}
                        required
                    />

                    {/* Ya no necesitamos mostrar el error aquí, porque se muestra en un pop-up */}
                    {/* {error && <p className="error-message">{error}</p>} */}

                    <div className='buttons'>
                        <button type="submit" className="login" disabled={cargando}>
                            {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    )
}

export default Login;