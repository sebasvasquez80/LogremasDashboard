import './Home.css';
import { FaShieldAlt, FaExclamationTriangle, FaBell } from "react-icons/fa";

function Home() {
    return (
            <> 
{/* --- ÁREA DE CONTENIDO PRINCIPAL --- */}
            <section className="home-content">
                <div className="home-header">
                    <h1>Dashboard</h1>
                </div>
                {/* --- Fila de Tarjetas KPI --- */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)' }}>
                            <FaShieldAlt className="kpi-icon" style={{ color: '#28a745' }} />
                        </div>
                        <div className="kpi-info">
                            <span className="kpi-title">Días Seguros</span>
                            <span className="kpi-value">2700</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                            <FaExclamationTriangle className="kpi-icon" style={{ color: '#ffc107' }} />
                        </div>
                        <div className="kpi-info">
                            <span className="kpi-title">Accidentes (Año)</span>
                            <span className="kpi-value">0</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ backgroundColor: 'rgba(0, 123, 255, 0.1)' }}>
                            <FaBell className="kpi-icon" style={{ color: '#007bff' }} />
                        </div>
                        <div className="kpi-info">
                            <span className="kpi-title">Alertas Pendientes</span>
                            <span className="kpi-value">3</span>
                        </div>
                    </div>
                </div>

                {/* --- Gráfica Principal --- */}
                <div className="dashboard-card chart-card">
                    <h3>Grafico</h3>
                    <div className="chart-placeholder">
                        <p>Contenido</p>
                    </div>
                </div>
            </section>

            {/* --- ÁREA DE ESTADÍSTICAS FIJA (LA BARRA DERECHA) --- */}
            <section className='home-stats'>
                <h3>Actividad Reciente</h3>
                <ul className="activity-list">
                    <li>
                        <p>Nuevo documento 'Plan de Operaciones' añadido a Planeación.</p>
                    </li>
                    <li>
                        <p>Usuario 'svasquezbust' actualizó su perfil.</p>
                    </li>
                    <li>
                        <p>Se registró un nuevo usuario: 'Edison'.</p>
                    </li>
                    <li>
                        <p>El documento 'WMS' fue eliminado.</p>
                    </li>
                </ul>
            </section>

            </>
    );
}

export default Home;