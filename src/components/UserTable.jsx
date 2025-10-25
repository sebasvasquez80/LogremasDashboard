import './/UserTable.css'; // Crearemos este archivo para los estilos de la tabla

// Este componente recibe la lista de usuarios como un "prop"
function UserTable({ usuarios, onBorrar, onEditar }) {

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
        <div className="tbl-container">
            <h2>Usuarios Existentes</h2>
            <div className="tabla-scroll-container">
            <table className="tabla-usuarios">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Usuario</th>
                        <th>Rol ID</th>
                        <th>Subregion ID</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Hacemos un "map" para crear una fila por cada usuario */}
                    {usuarios.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.nombre}</td>
                            <td>{user.usuario}</td>
                            <td>{getRolNombre(user.id_rol)}</td>
                            <td>{getSubregion(user.id_subregion)}</td>
                            <td className="acciones">
                                {/* El botón de editar ahora llama a onEditar, pasándole el objeto de usuario completo */}
                                <button
                                    className="btn-editar"
                                    onClick={() => onEditar(user)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="btn-borrar"
                                    onClick={() => onBorrar(user.id, user.nombre)}
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

export default UserTable;