const express = require('express');
const router = express.Router();
const Proyecto = require('../models/Proyecto');  // Modelo de proyectos
const tareasRoutes = require('./tarea');  // Rutas de tareas

// Usar las rutas de tareas para cualquier proyecto con un id específico
router.use('/:id/tareas', tareasRoutes);

// Obtener todos los proyectos
router.get('/', async (req, res) => {
  try {
    const proyectos = await Proyecto.findAll();
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los proyectos' });
  }
});

// Obtener un proyecto por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const proyecto = await Proyecto.findByPk(id);
    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el proyecto' });
  }
});

// Actualizar un proyecto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha_creacion, activo } = req.body;

  try {
    const proyecto = await Proyecto.findByPk(id);

    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Actualizar los campos solo si se pasan en el body
    proyecto.titulo = titulo || proyecto.titulo;
    proyecto.descripcion = descripcion || proyecto.descripcion;
    proyecto.fecha_creacion = fecha_creacion || proyecto.fecha_creacion; // Si no se pasa, mantiene la fecha original
    proyecto.activo = activo !== undefined ? activo : proyecto.activo; // Si no se pasa, mantiene el valor original

    await proyecto.save();  // Guardar los cambios en la base de datos

    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el proyecto' });
  }
});


// Eliminar un proyecto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const proyecto = await Proyecto.findByPk(id);
    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    await proyecto.destroy();  // Eliminar el proyecto de la base de datos

    res.status(204).send();  // Responder sin contenido
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el proyecto' });
  }
});
// Crear un nuevo proyecto
// En el backend (proyecto.js o el archivo correspondiente)
router.post('/', async (req, res) => {
  try {
    // Desestructurar los valores del cuerpo de la solicitud
    const { nombre, descripcion, fecha_creacion, activo } = req.body;

    // Validación para asegurarse de que los datos requeridos no estén vacíos
    if (!nombre || !descripcion || activo === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }

    // Si no se proporciona fecha_creacion, se asigna la fecha actual
    const nuevaFechaCreacion = fecha_creacion ? new Date(fecha_creacion) : new Date();

    // Convertir la fecha a un formato compatible con SQL Server (YYYY-MM-DD HH:MM:SS)
    const fechaCreacionFormateada = nuevaFechaCreacion.toISOString().slice(0, 19).replace('T', ' ');

    // Crear el nuevo proyecto con la fecha de creación asignada
    const nuevoProyecto = await Proyecto.create({
      nombre,
      descripcion,
      fecha_creacion: fechaCreacionFormateada,
      activo,
    });

    // Responder con el proyecto creado
    res.status(201).json(nuevoProyecto);
  } catch (error) {
    console.error(error);  // Para ver el error en la consola del servidor
    res.status(500).json({ error: 'Ocurrió un error al crear el proyecto.' });
  }
});


module.exports = router;
