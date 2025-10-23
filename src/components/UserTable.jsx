import './/UserTable.css'; // Crearemos este archivo para los estilos de la tabla

// Este componente recibe la lista de usuarios como un "prop"
function UserTable({ usuarios, onBorrar, onEditar }) {
    return (
        <div className="tbl-container">
            <h2>Usuarios Existentes</h2>
            <div className="tabla-scroll-container">
            <table className="tabla-usuarios">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre de Usuario</th>
                        <th>Rol ID</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Hacemos un "map" para crear una fila por cada usuario */}
                    {usuarios.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.nombre}</td>
                            <td>{user.id_rol === 1 ? 'Admin' : 'Operario'}</td>
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