import './LateralNav.css';
import { useNavigate, NavLink } from "react-router-dom";
import { useState, useEffect } from 'react';
import { LuLayoutDashboard, LuCalendarClock, LuChartColumnBig, LuNotebookPen, LuChartLine } from "react-icons/lu";

function LateralNav({ isOpen }) {

    // --- CAMBIO 1: El estado del usuario ---
    // Lo usaremos para guardar la información del usuario logueado
    const [usuario, setUsuario] = useState(null);

    // --- CAMBIO 2: Cargar el usuario desde localStorage ---
    // Este useEffect se ejecuta solo una vez, cuando el componente carga.
    useEffect(() => {
        // ¡Cambiamos 'usuario' por el nombre de llave que SÍ usas en tu login!
        // (Supongamos que se llama 'token' o 'user', ajusta esto)
        const usuarioGuardado = localStorage.getItem('user'); 
        
        // --- ¡AÑADE ESTAS LÍNEAS DE DEPURACIÓN! ---
        console.log("Contenido de localStorage ('usuario'):", usuarioGuardado);

        if (usuarioGuardado) {
            try {
                const usuarioParseado = JSON.parse(usuarioGuardado);
                console.log("Objeto de usuario parseado:", usuarioParseado);
                setUsuario(usuarioParseado);
            } catch (e) {
                console.error("Error al parsear el JSON del usuario:", e);
            }
        } else {
            console.log("No se encontró el ítem 'usuario' en localStorage.");
        }
    }, []); // El array vacío [] asegura que solo se ejecute al montar.

    // --- CAMBIO 3: Tu nueva lógica de permisos ---
    // Comprobamos si el 'usuario' existe Y si su 'id' es 1 o 4.
    // (Asegúrate de que tu objeto de usuario tenga la propiedad 'id')
    const verFacturacion = usuario && (usuario.id_rol === 1 || usuario.id_rol === 4);

    return (
        <div className={`lateral-nav ${isOpen ? 'drawer-open' : 'drawer-closed'}`}>
            <nav className='nav-menu'>
                <ul className="nav-list">
                    
                    <NavLink to="/home" className="nav-item">
                        <LuLayoutDashboard className="nav-icon" />
                        <span className="nav-text">Dashboard</span>
                    </NavLink>

                    <NavLink to="/planeacion" className="nav-item">
                        <LuCalendarClock className="nav-icon" />
                        <span className="nav-text">Planeación</span>
                    </NavLink>

                    <NavLink to="/indicadores" className='nav-item'>
                        <LuChartColumnBig className="nav-icon" />
                        <span className="nav-text">Indicadores</span>
                    </NavLink>

                    <NavLink to="/gestion" className='nav-item'>
                        <LuNotebookPen className="nav-icon" />
                        <span className="nav-text">Gestión</span>
                    </NavLink>

                    {verFacturacion && (
                        <NavLink to="/facturacion" className='nav-item'>
                            <LuChartLine className="nav-icon" />
                            <span className="nav-text">Facturación</span>
                        </NavLink>
                    )}
                </ul>
            </nav>
        </div>
    );
}

export default LateralNav;