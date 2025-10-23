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
    element: <PageLayout><Home /></PageLayout>
    },
    {
    path: '/planeacion',
    element: <PageLayout><Planeacion/></PageLayout>
    },
    {
    path: '/indicadores',
    element: <PageLayout><Indicadores/></PageLayout>
    },
    {
    path: '/gestion',
    element: <PageLayout><Gestion/></PageLayout>
    },
    {
    path: '/usersettings',
    element: <PageLayout><UserSettings/></PageLayout>
    },
    {
    path: '/createuser',
    element: <PageLayout><CreateUser/></PageLayout>
    },
    {
    path: '/creardocumento',
    element: <PageLayout><CrearDocumento/></PageLayout>
    },
    {
    path: '/cambiarcontrasena',
    element: <PageLayout><CambiarContrasena/></PageLayout>
    }
]