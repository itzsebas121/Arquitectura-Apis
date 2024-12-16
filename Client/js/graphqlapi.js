document.addEventListener('DOMContentLoaded',()=>{
const obtenerProyectosQuery = `
query {
  proyectos {
    id
    nombre
    descripcion
    activo
  }
}
`;
const obtenerTareasQuery = `
query {
  tareas {
    id
    proyecto_id
    titulo
    descripcion
    estado
    prioridad
    fecha_vencimiento
  }
}
`;
const obtenerComentariosQuery = `
query {
  comentarios {
    id
    tarea_id
    contenido
  }
}
`;

const crearProyectoMutation = `
mutation CrearProyecto($nombre: String!, $descripcion: String, $activo: Boolean) {
  crearProyecto(nombre: $nombre, descripcion: $descripcion, activo: $activo) {
    id
    nombre
    descripcion
    activo
  }
}
`;

const crearTareaMutation = `
mutation CrearTarea($proyecto_id: Int!, $titulo: String!, $descripcion: String, $estado: String!, $prioridad: String!, $fecha_vencimiento: String) {
  crearTarea(proyecto_id: $proyecto_id, titulo: $titulo, descripcion: $descripcion, estado: $estado, prioridad: $prioridad, fecha_vencimiento: $fecha_vencimiento) {
    id
    titulo
    descripcion
    estado
    prioridad
    fecha_vencimiento
  }
}
`;

const crearComentarioMutation = `
mutation CrearComentario($tarea_id: Int!, $contenido: String!) {
  crearComentario(tarea_id: $tarea_id, contenido: $contenido) {
    id
    contenido
  }
}
`;

async function hacerQuery(query, variables = {}) {
const response = await fetch('http://localhost:4000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: query,
    variables: variables,
  }),
});
const data = await response.json();
return data.data;
}

// Función para mostrar los proyectos en una tabla
function mostrarProyectos(proyectos) {
const contenedor = document.getElementById('proyectos');
contenedor.innerHTML = ''; // Limpiar el contenedor antes de mostrar
if (proyectos.length === 0) {
  contenedor.innerHTML = 'No hay proyectos.';
} else {
  const table = document.createElement('table');
  const header = document.createElement('thead');
  header.innerHTML = `
    <tr>
      <th>ID</th>
      <th>Nombre</th>
      <th>Descripción</th>
      <th>Activo</th>
      <th>Acciones</th>
    </tr>
  `;
  table.appendChild(header);
  
  const body = document.createElement('tbody');
  proyectos.forEach(proyecto => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${proyecto.id}</td>
      <td>${proyecto.nombre}</td>
      <td>${proyecto.descripcion}</td>
      <td>${proyecto.activo ? 'Sí' : 'No'}</td>
      <td>
        <button onclick="verTareas(${proyecto.id})">Ver Tareas</button>
      </td>
    `;
    body.appendChild(row);
  });
  table.appendChild(body);
  contenedor.appendChild(table);
}
}

// Función para mostrar las tareas de un proyecto seleccionado
async function verTareas(proyecto_id) {
const tareas = await hacerQuery(obtenerTareasQuery);
const tareasFiltradas = tareas.tareas.filter(tarea => tarea.proyecto_id === proyecto_id);
mostrarTareas(tareasFiltradas);
}

// Función para mostrar las tareas en una tabla
function mostrarTareas(tareas) {
const contenedor = document.getElementById('tareas');
contenedor.innerHTML = ''; // Limpiar el contenedor antes de mostrar
if (tareas.length === 0) {
  contenedor.innerHTML = 'No hay tareas para este proyecto.';
} else {
  const table = document.createElement('table');
  const header = document.createElement('thead');
  header.innerHTML = `
    <tr>
      <th>ID</th>
      <th>Título</th>
      <th>Descripción</th>
      <th>Estado</th>
      <th>Prioridad</th>
      <th>Fecha de Vencimiento</th>
    </tr>
  `;
  table.appendChild(header);

  const body = document.createElement('tbody');
  tareas.forEach(tarea => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${tarea.id}</td>
      <td>${tarea.titulo}</td>
      <td>${tarea.descripcion}</td>
      <td>${tarea.estado}</td>
      <td>${tarea.prioridad}</td>
      <td>${tarea.fecha_vencimiento}</td>
    `;
    body.appendChild(row);
  });
  table.appendChild(body);
  contenedor.appendChild(table);
}
}

// Función para mostrar los comentarios en una tabla
function mostrarComentarios(comentarios) {
const contenedor = document.getElementById('comentarios');
contenedor.innerHTML = ''; // Limpiar el contenedor antes de mostrar
if (comentarios.length === 0) {
  contenedor.innerHTML = 'No hay comentarios.';
} else {
  const table = document.createElement('table');
  const header = document.createElement('thead');
  header.innerHTML = `
    <tr>
      <th>ID</th>
      <th>Contenido</th>
    </tr>
  `;
  table.appendChild(header);

  const body = document.createElement('tbody');
  comentarios.forEach(comentario => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${comentario.id}</td>
      <td>${comentario.contenido}</td>
    `;
    body.appendChild(row);
  });
  table.appendChild(body);
  contenedor.appendChild(table);
}
}

// Función para manejar la creación de un proyecto
document.getElementById('form-proyecto').addEventListener('submit', async (e) => {
e.preventDefault();
const nombre = document.getElementById('nombre').value;
const descripcion = document.getElementById('descripcion').value;
const activo = document.getElementById('activo').checked;

const proyecto = await hacerQuery(crearProyectoMutation, {
  nombre,
  descripcion,
  activo,
});

mostrarProyectos([proyecto.crearProyecto]);
});

// Función para manejar la creación de una tarea
document.getElementById('form-tarea').addEventListener('submit', async (e) => {
e.preventDefault();
const proyecto_id = parseInt(document.getElementById('proyecto_id_tarea').value);
const titulo = document.getElementById('titulo').value;
const descripcion = document.getElementById('descripcion_tarea').value;
const estado = document.getElementById('estado').value;
const prioridad = document.getElementById('prioridad').value;
const fecha_vencimiento = document.getElementById('fecha_vencimiento').value;

const tarea = await hacerQuery(crearTareaMutation, {
  proyecto_id,
  titulo,
  descripcion,
  estado,
  prioridad,
  fecha_vencimiento,
});

mostrarTareas([tarea.crearTarea]);
});

// Función para manejar la creación de un comentario
document.getElementById('form-comentario').addEventListener('submit', async (e) => {
e.preventDefault();
const tarea_id = parseInt(document.getElementById('tarea_id_comentario').value);
const contenido = document.getElementById('contenido_comentario').value;

const comentario = await hacerQuery(crearComentarioMutation, {
  tarea_id,
  contenido,
});

mostrarComentarios([comentario.crearComentario]);
});

// Cargar proyectos al iniciar
window.onload = async () => {
const proyectos = await hacerQuery(obtenerProyectosQuery);
mostrarProyectos(proyectos.proyectos);
const tareas = await hacerQuery(obtenerTareasQuery);
mostrarTareas(tareas.tareas);
const comentarios = await hacerQuery(obtenerComentariosQuery);
mostrarComentarios(comentarios.comentarios);
}
});