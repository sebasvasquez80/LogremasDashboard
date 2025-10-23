import './Informacion.css';
import imagenes from '../assets/imagenes';
import { VscAccount } from "react-icons/vsc";
import { useNavigate } from 'react-router-dom';

function Informacion() {

    const navigate = useNavigate();

    const rutaLogin = () => {
        navigate('/login');
    }

    return (
        <div className='informacion-page'>
            <nav>

                <img src={imagenes.img1} alt="" />

                <h1>Información</h1>

                <div>
                    <span>Ingresa</span>
                    <button className='login-btn' onClick={rutaLogin}>
                        <VscAccount />
                    </button>
                </div>
            </nav>

            <section className='informacion-content'>
                <h2>Bienvenido a la sección de Información</h2>
                <p>Aquí encontrarás detalles relevantes y actualizaciones importantes.</p>
            </section>

        </div>
    )

}

export default Informacion;