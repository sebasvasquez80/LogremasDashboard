import Login from '..//pages/Login.jsx';
import Home from '..//pages/Home.jsx';
import Planeacion from '..//pages/Planeacion.jsx';
import Indicadores from '..//pages/Indicadores.jsx';
import Gestion from '..//pages/Gestion.jsx';
import UserSettings from '..//pages/UserSettings.jsx';
import CreateUser from '../pages/CreateUser.jsx';
import CrearDocumento from '../pages/CrearDocumento.jsx';
import PageLayout from '../components/PageLayout.jsx';
import Informacion from '../pages/Informacion.jsx';
import CambiarContrasena from '../pages/CambiarContrasena.jsx';
import Facturacion from '../pages/Facturacion.jsx';
import ProtegerRuta from '../helpers/ProtegerRuta.jsx';
import Nomina from '../pages/Nomina.jsx';

export let Enrutador = [
    {
    path: '/',
    element: <Informacion/>
    },
    {
    path: '/login',
    element: <Login/>
    },
    {
    path: '/home',
    element: <ProtegerRuta> <PageLayout><Home /></PageLayout> </ProtegerRuta>
    },
    {
    path: '/planeacion',
    element: <ProtegerRuta> <PageLayout><Planeacion/></PageLayout> </ProtegerRuta>
    },
    {
    path: '/indicadores',
    element: <ProtegerRuta> <PageLayout><Indicadores/></PageLayout> </ProtegerRuta>
    },
    {
    path: '/gestion',
    element: <ProtegerRuta> <PageLayout><Gestion/></PageLayout> </ProtegerRuta>
    },
    {
    path: '/usersettings',
    element: <ProtegerRuta> <PageLayout><UserSettings/></PageLayout> </ProtegerRuta>
    },
    {
    path: '/createuser',
    element: <ProtegerRuta> <PageLayout><CreateUser/></PageLayout> </ProtegerRuta>
    },
    {
    path: '/creardocumento',
    element: <ProtegerRuta> <PageLayout><CrearDocumento/></PageLayout> </ProtegerRuta>
    },
    {
    path: '/cambiarcontrasena',
    element: <ProtegerRuta> <PageLayout><CambiarContrasena/></PageLayout> </ProtegerRuta>
    },
    {
    path: '/facturacion',
    element: <ProtegerRuta> <PageLayout><Facturacion/></PageLayout> </ProtegerRuta>
    },
    {
    path: '/nomina',
    element: <ProtegerRuta> <PageLayout><Nomina/></PageLayout> </ProtegerRuta>
    }
]