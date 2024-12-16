document.addEventListener('DOMContentLoaded', function () {
    const socket = io('http://localhost:3000');

    // Obtener la tabla de proyectos
    const proyectosTable = document.getElementById('proyectos-table');
    const formulario = document.getElementById('form-proyecto');
    const nombreInput = document.getElementById('nombre');
    const descripcionInput = document.getElementById('descripcion');
    const idInput = document.getElementById('id');

    socket.on('proyectos', function (proyectos) {
        proyectosTable.innerHTML = ` <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>`; // Limpiar la tabla
        proyectos.forEach(proyecto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                    <td>${proyecto.id}</td>
                    <td>${proyecto.nombre}</td>
                    <td>${proyecto.descripcion}</td>
                    <td>
                        <button class="btn-editar" data-id="${proyecto.id}">Editar</button>
                        <button class="btn-eliminar" data-id="${proyecto.id}">Eliminar</button>
                    </td>
                `;
            proyectosTable.appendChild(row);
        });
    });


    socket.on('notificacion', function (data) {
        alert(` ${data.tipo}: ${data.proyecto ? data.proyecto.nombre : data.id}`);
    });


    formulario.addEventListener('submit', function (e) {
        e.preventDefault();
        const proyecto = {
            id: idInput.value,
            nombre: nombreInput.value,
            descripcion: descripcionInput.value
        };

        if (proyecto.id) {
            socket.emit('actualizarProyecto', proyecto); 
        } else {
            socket.emit('insertarProyecto', proyecto);
        }

        formulario.reset();
    });


    proyectosTable.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-editar')) {
            const id = e.target.getAttribute('data-id');
            const fila = e.target.closest('tr');
            const nombre = fila.children[1].textContent;
            const descripcion = fila.children[2].textContent;

            nombreInput.value = nombre;
            descripcionInput.value = descripcion;
            idInput.value = id; 
        }

        if (e.target.classList.contains('btn-eliminar')) {
            const id = e.target.getAttribute('data-id');
            socket.emit('eliminarProyecto', id);
        }
    });
});
