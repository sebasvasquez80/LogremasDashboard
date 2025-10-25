import './TablaDocumento.css'; // Crearemos este archivo para los estilos de la tabla

// Este componente recibe la lista de usuarios como un "prop"
function TablaDocumento({ documentos, onBorrar, onEditar }) {

    const getNombrePestana = (id) => {
        switch (id) {
            case 1:
                return 'Planeación';
            case 2:
                return 'Graficos';
            case 3:
                return 'Gestión';
            case 4:
                return 'Facturación'
            default:
                return 'Desconocido'; // Una opción por defecto por si el id no es 1, 2 o 3
        }
    };

    const getRolNombre = (idRol) => {
        switch (idRol) {
            case 1:
                return 'Administración';
            case 2:
                return 'Coordinación';
            case 3:
                return 'Lideración';
            case 4:
                return 'Desarrollo';
            default:
                return 'Desconocido'; // Para cualquier otro valor inesperado
        }
    }

    const getSubregion = (idSubregion) => {
        switch (idSubregion) {
            case 1:
                return 'Sur Antioquia';
            case 2:
                return 'Norte Antioquia';
            case 3:
                return 'Occidente Cundinamarca';
            case 4:
                return 'Norte Cundinamarca';
            case 5:
                return 'Valle Atlantico';
            default:
                return 'Desconocido'           
        }
    }

    return (
        <div className="tabla-container">
            <h2>Documentos Existentes</h2>
            <div className="tabla-scroll-container">
            <table className="tabla-usuarios">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre de Documento</th>
                        <th>URL</th>
                        <th>Rol</th>
                        <th>Clase</th>
                        <th>Subregion</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Hacemos un "map" para crear una fila por cada usuario */}
                    {documentos.map(document => (
                        <tr key={document.id}>
                            <td>{document.id}</td>
                            <td>{document.nombre}</td>
                            <td className="url-cell" title={document.url}>
                                {document.url}
                            </td>
                            <td>{getRolNombre(document.id_rol)}</td>
                            <td>{getNombrePestana(document.id_pagina)}</td>
                            <td>{getSubregion(document.id_subregion)}</td>
                            <td className="acciones">
                                {/* El botón de editar ahora llama a onEditar, pasándole el objeto de usuario completo */}
                                <button
                                    className="btn-editar"
                                    onClick={() => onEditar(document)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="btn-borrar"
                                    onClick={() => onBorrar(document.id, document.nombre)}
                                >
                                    Borrar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}

export default TablaDocumento;