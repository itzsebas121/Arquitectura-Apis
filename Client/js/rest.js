document.addEventListener('DOMContentLoaded', () => {
    let proyectoIdSeleccionado = null;
    let tareaIdSeleccionada = null;
    const proyectoid=0;
    var nomProyecto='';
    async function cargarProyectos() {
        const response = await fetch('http://localhost:3000/api/proyectos');
        const proyectos = await response.json();
        
        const tableBody = document.querySelector('#proyectosTable tbody');
        tableBody.innerHTML = '';

        proyectos.forEach(proyecto => {
            const row = document.createElement('tr');
            row.dataset.id = proyecto.id;

            row.innerHTML = `
                <td>${proyecto.id}</td>
                <td>${proyecto.nombre}</td>
                <td>${proyecto.descripcion}</td>
                <td>${new Date(proyecto.fecha_creacion).toLocaleDateString()}</td>
                <td>${proyecto.activo ? 'Sí' : 'No'}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function cargarDatosFormulario(event) {
        const row = event.target.closest('tr');
        if (!row) return;
        
         proyectoIdSeleccionado = row.dataset.id;
         
        
        fetch(`http://localhost:3000/api/proyectos/${proyectoIdSeleccionado}`)
            .then(response => response.json())
            .then(proyecto => {
                document.getElementById('proyectoTitulo').value = proyecto.nombre;
                document.getElementById('proyectoDescripcion').value = proyecto.descripcion;
                document.getElementById('fechaCreacionProyecto').value = proyecto.fecha_creacion.slice(0, 10);
                document.getElementById('activoProyecto').value = proyecto.activo ? '1' : '0';
                
                document.getElementById('btnActualizarProyecto').hidden = false;
                document.getElementById('btnEliminarProyecto').hidden = false;
            nomProyecto=proyecto.nombre;
                
                cargarTareas(proyectoIdSeleccionado);
                const ctask =document.getElementById('cotainerTareas')
             const titulo =document.getElementById('tituloProyecto')
             document.getElementById('titleFormTask').innerHTML='Crera tarea en '+proyecto.nombre;
                ctask.classList.remove('hidden');
                titulo.innerHTML='Tareas para: '+nomProyecto;
            });
    }

    async function cargarTareas(proyectoId) {
        

        const response = await fetch(`http://localhost:3000/api/proyectos/${proyectoId}/tareas`);
        const tareas = await response.json();
    
        const tareasTableBody = document.querySelector('#tareasTable tbody');
        tareasTableBody.innerHTML = ''; 
    

        if (tareas.message) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="7">No hay tareas para este proyecto</td>`; // Asegúrate de que la columna tenga el número adecuado
            tareasTableBody.appendChild(row);
        } else if (Array.isArray(tareas)) {
            // Si la respuesta es un array de tareas, muestra las filas en la tabla
            tareas.forEach(tarea => {
                const row = document.createElement('tr');
                row.dataset.id = tarea.id;
    
                row.innerHTML = `
                    <td>${tarea.id}</td>
                    <td>${tarea.titulo}</td>
                    <td>${tarea.descripcion}</td>
                    <td>${tarea.estado}</td>
                    <td>${tarea.prioridad}</td>
                    <td>${new Date(tarea.fecha_creacion).toLocaleDateString()}</td>
                    <td>${new Date(tarea.fecha_vencimiento).toLocaleDateString()}</td>
                `;
    
                tareasTableBody.appendChild(row);
            });
        }
    }
    
    function cargarFormularioTarea(event) {
        const row = event.target.closest('tr');
        if (!row) return;
        
        tareaIdSeleccionada = row.dataset.id;
        

        fetch(`http://localhost:3000/api/proyectos/${proyectoIdSeleccionado}/tareas/${tareaIdSeleccionada}`)
            .then(response => response.json())
            .then(tarea => {
                document.getElementById('tareaTitulo').value = tarea.titulo;
                document.getElementById('tareaDescripcion').value = tarea.descripcion;
                document.getElementById('tareaEstado').value = tarea.estado;
                document.getElementById('tareaPrioridad').value = tarea.prioridad;
                document.getElementById('fechaCreacionTarea').value = tarea.fecha_creacion.slice(0, 10);
                document.getElementById('fechaVencimientoTarea').value = tarea.fecha_vencimiento.slice(0, 10);

                document.getElementById('btnActualizarTarea').hidden = false;
                document.getElementById('btnEliminarTarea').hidden = false;
            });
    }

    function limpiarFormulario() {
        document.getElementById('proyectoTitulo').value = '';
        document.getElementById('proyectoDescripcion').value = '';
        document.getElementById('fechaCreacionProyecto').value = '';
        document.getElementById('activoProyecto').value = '1';
        
        document.getElementById('btnActualizarProyecto').hidden = true;
        document.getElementById('btnEliminarProyecto').hidden = true;
        
        document.getElementById('tareaTitulo').value = '';
        document.getElementById('tareaDescripcion').value = '';
        document.getElementById('tareaEstado').value = 'pendiente';
        document.getElementById('tareaPrioridad').value = 'alta';
        document.getElementById('fechaCreacionTarea').value = '';
        document.getElementById('fechaVencimientoTarea').value = '';
        
        document.getElementById('btnActualizarTarea').hidden = true;
        document.getElementById('btnEliminarTarea').hidden = true;
    }

    async function crearProyecto() {
        const proyecto = {
            nombre: document.getElementById('proyectoTitulo').value,
            descripcion: document.getElementById('proyectoDescripcion').value,
            fecha_creacion: document.getElementById('fechaCreacionProyecto').value,
            activo: document.getElementById('activoProyecto').value === '1' ? true : false
        };

        if (!proyecto.nombre || !proyecto.descripcion || !proyecto.fecha_creacion) {
            return alert("Por favor, completa todos los campos.");
        }

        await fetch('http://localhost:3000/api/proyectos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proyecto)
        });

        cargarProyectos();
        limpiarFormulario();
    }

    async function actualizarProyecto() {
        let proyectoid= document.querySelector('tr.selected')?.dataset.id;
       
        if (!proyectoid) return alert('Selecciona un proyecto');

        const proyecto = {
            nombre: document.getElementById('proyectoTitulo').value,
            descripcion: document.getElementById('proyectoDescripcion').value,
            fecha_creacion: document.getElementById('fechaCreacionProyecto').value,
            activo: document.getElementById('activoProyecto').value === '1' ? true : false
        };

        await fetch(`http://localhost:3000/api/proyectos/${proyectoid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proyecto)
        });

        cargarProyectos();
        limpiarFormulario();
    }

    async function eliminarProyecto() {
        const id = document.querySelector('tr.selected')?.dataset.id;
        if (!id) return alert('Selecciona un proyecto');

        await fetch(`http://localhost:3000/api/proyectos/${id}`, {
            method: 'DELETE'
        });

        cargarProyectos();
        limpiarFormulario();
    }

    async function crearTarea() {
        const tarea = {
            titulo: document.getElementById('tareaTitulo').value,
            descripcion: document.getElementById('tareaDescripcion').value,
            estado: document.getElementById('tareaEstado').value,
            prioridad: document.getElementById('tareaPrioridad').value,
            fecha_creacion: document.getElementById('fechaCreacionTarea').value,
            fecha_vencimiento: document.getElementById('fechaVencimientoTarea').value
        };

        if (!tarea.titulo || !tarea.descripcion || !tarea.fecha_creacion || !tarea.fecha_vencimiento) {
            return alert("Por favor, completa todos los campos.");
        }

        await fetch(`http://localhost:3000/api/proyectos/${proyectoIdSeleccionado}/tareas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tarea)
        });

        cargarTareas(proyectoIdSeleccionado);
        limpiarFormulario();
    }

    async function actualizarTarea() {
        const tarea = {
            titulo: document.getElementById('tareaTitulo').value,
            descripcion: document.getElementById('tareaDescripcion').value,
            estado: document.getElementById('tareaEstado').value,
            prioridad: document.getElementById('tareaPrioridad').value,
            fecha_creacion: document.getElementById('fechaCreacionTarea').value,
            fecha_vencimiento: document.getElementById('fechaVencimientoTarea').value
        };

        await fetch(`http://localhost:3000/api/proyectos/${proyectoIdSeleccionado}/tareas/${tareaIdSeleccionada}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tarea)
        });

        cargarTareas(proyectoIdSeleccionado);
        limpiarFormulario();
    }

    async function eliminarTarea() {
        if (!tareaIdSeleccionada) {
            return alert('Selecciona una tarea');
        }
        alert(proyectoIdSeleccionado);
    
        try {
            const response = await fetch(`http://localhost:3000/api/proyectos/${proyectoIdSeleccionado}/tareas/${tareaIdSeleccionada}`, {
                method: 'DELETE'
            });
    
            if (!response.ok) {
                // Si la respuesta no es 2xx, mostramos el error
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Hubo un problema al eliminar la tarea'}`);
            } else {
                // Si la tarea se eliminó correctamente, recargamos las tareas y limpiamos el formulario
                cargarTareas(proyectoIdSeleccionado);
                limpiarFormulario();
            }
        } catch (error) {
            // Si ocurre un error inesperado (por ejemplo, problemas de red), lo mostramos
            console.error(error);
            alert('Ocurrió un error al intentar eliminar la tarea. Por favor, inténtalo de nuevo.');
        }
    }
    

    cargarProyectos();

    document.querySelector('#proyectosTable').addEventListener('click', function(event) {
        const row = event.target.closest('tr');
        if (!row) return;
        
        document.querySelectorAll('tr').forEach(row => row.classList.remove('selected'));
        row.classList.add('selected');
        cargarDatosFormulario(event);
    });

    document.querySelector('#tareasTable').addEventListener('click', cargarFormularioTarea);

    document.getElementById('btnCrearProyecto').addEventListener('click', crearProyecto);
    document.getElementById('btnActualizarProyecto').addEventListener('click', actualizarProyecto);
    document.getElementById('btnEliminarProyecto').addEventListener('click', eliminarProyecto);
    document.getElementById('btnCrearTarea').addEventListener('click', crearTarea);
    document.getElementById('btnActualizarTarea').addEventListener('click', actualizarTarea);
    document.getElementById('btnEliminarTarea').addEventListener('click', eliminarTarea);
    document.getElementById('btnLimpiarTarea').addEventListener('click', limpiarFormulario);
    document.getElementById('btnLimpiarProyecto').addEventListener('click', limpiarFormulario);
    
});
