import './LateralNav.css';
import { useNavigate, NavLink } from "react-router-dom";
// Importamos iconos para cada opción
import { LuLayoutDashboard, LuCalendarClock, LuChartColumnBig, LuNotebookPen, LuChartLine } from "react-icons/lu";

function LateralNav({ isOpen }) {
    // No necesitamos useNavigate si usamos NavLink
    // const navigate = useNavigate();
    

    return (
        <div className={`lateral-nav ${isOpen ? 'drawer-open' : 'drawer-closed'}`}>
            <nav className='nav-menu'>
                {/* La lista ahora empieza directamente */}
                <ul className="nav-list">
                    {/* Usamos NavLink para la navegación y el estado activo */}
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

                    <NavLink to="/facturacion" className='nav-item'>
                        <LuChartLine className="nav-icon" />
                        <span className="nav-text">Facturación</span>
                    </NavLink>
                </ul>
            </nav>
        </div>
    );
}

export default LateralNav;