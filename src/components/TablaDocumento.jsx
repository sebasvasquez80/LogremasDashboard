import './TablaDocumento.css'; // Crearemos este archivo para los estilos de la tabla

// Este componente recibe la lista de usuarios como un "prop"
function TablaDocumento({ documentos, onBorrar, onEditar }) {

    const getNombrePestana = (id) => {
        switch (id) {
            case 1:
                return 'planeacion';
            case 2:
                return 'graficos';
            case 3:
                return 'gestion';
            default:
                return 'Desconocido'; // Una opción por defecto por si el id no es 1, 2 o 3
        }
    };

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
                        <th>Rol ID</th>
                        <th>Clase</th>
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
                            <td>{document.id_rol === 1 ? 'Admin' : 'Operario'}</td>
                            <td>{getNombrePestana(document.page_id)}</td>
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