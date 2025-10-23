import './SuperiorNav.css';
import { CiUser, CiLogout, CiHome } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { FaBars } from "react-icons/fa";
import imagenes from '../assets/imagenes';

function SuperiorNav({ onMenuClick }) {
    const navigate = useNavigate();
    const rutaHome = () => navigate('/home');
    const rutaUserSettings = () => navigate('/usersettings');

    const handleLogout = () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Quieres cerrar la sesión?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/');
            }
        });
    };

    return (
        <div className="sup-nav__container">
            <button className="sup-nav__hamburger" onClick={(e) => { e.stopPropagation(); onMenuClick(); }}>
                <FaBars />
            </button>

            <img src={imagenes.img1} alt="" />
            
            <section className="sup-nav__content">
                <button onClick={handleLogout} className="sup-nav__button sup-nav__button--logout">
                    <CiLogout className='sup-nav__icon' />
                </button>
                <button onClick={rutaUserSettings} className="sup-nav__button sup-nav__button--user">
                    <CiUser className='sup-nav__icon' />
                </button>
                <button onClick={rutaHome} className="sup-nav__button sup-nav__button--home">
                    <CiHome className='sup-nav__icon' />
                </button>
            </section>
        </div>
    );
}

export default SuperiorNav;