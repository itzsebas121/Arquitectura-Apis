const express = require('express');
const Tarea = require('../models/tarea');
const Proyecto = require('../models/Proyecto');
const router = express.Router();

// Obtener las tareas de un proyecto
router.get('/:id/tareas', async (req, res) => {
  try {
    const proyectoId = parseInt(req.params.id); // Convertir a entero

    if (isNaN(proyectoId)) {
      return res.status(400).json({ message: 'ID del proyecto inválido' });
    }

    const proyecto = await Proyecto.findByPk(proyectoId);

    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const tareas = await Tarea.findAll({
      where: { proyecto_id: proyectoId }
    });

    if (tareas.length === 0) {
      return res.status(404).json({ message: 'No hay tareas para este proyecto' });
    }

    res.json(tareas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las tareas del proyecto' });
  }
});
// Insertar una nueva tarea
router.post('/:id/tareas', async (req, res) => {
  try {
    const proyectoId = parseInt(req.params.id);
    const { titulo, descripcion, estado, prioridad, fecha_vencimiento } = req.body;

    if (isNaN(proyectoId)) {
      return res.status(400).json({ message: 'ID del proyecto inválido' });
    }

    const proyecto = await Proyecto.findByPk(proyectoId);

    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const tarea = await Tarea.create({
      proyecto_id: proyectoId,
      titulo,
      descripcion,
      estado,
      prioridad,
      fecha_vencimiento
    });

    res.status(201).json(tarea);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la tarea' });
  }
});
// Actualizar una tarea
router.put('/:id/tareas/:id', async (req, res) => {
  try {
    const tareaId = parseInt(req.params.id);
    const { titulo, descripcion, estado, prioridad, fecha_vencimiento } = req.body;

    if (isNaN(tareaId)) {
      return res.status(400).json({ message: 'ID de tarea inválido' });
    }

    const tarea = await Tarea.findByPk(tareaId);

    if (!tarea) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Actualizar tarea
    tarea.titulo = titulo || tarea.titulo;
    tarea.descripcion = descripcion || tarea.descripcion;
    tarea.estado = estado || tarea.estado;
    tarea.prioridad = prioridad || tarea.prioridad;
    tarea.fecha_vencimiento = fecha_vencimiento || tarea.fecha_vencimiento;

    await tarea.save();

    res.json(tarea);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la tarea' });
  }
});
// Obtener una tarea por ID
router.get('/:id/tareas/:id', async (req, res) => {
  try {
    const tareaId = parseInt(req.params.id);

    if (isNaN(tareaId)) {
      return res.status(400).json({ message: 'ID de tarea inválido' });
    }

    const tarea = await Tarea.findByPk(tareaId);

    if (!tarea) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    res.json(tarea);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la tarea' });
  }
});
router.delete('/:id/tareas/:tareaId', async (req, res) => {
  try {
    const tareaId = parseInt(req.params.tareaId);
    const proyectoId = parseInt(req.params.id);

    if (isNaN(tareaId) || isNaN(proyectoId)) {
      return res.status(400).json({ message: 'ID de tarea o proyecto inválido' });
    }

    const proyecto = await Proyecto.findByPk(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const tarea = await Tarea.findOne({
      where: {
        id: tareaId,
        proyecto_id: proyectoId
      }
    });

    if (!tarea) {
      return res.status(404).json({ message: 'Tarea no encontrada en este proyecto' });
    }

    // Eliminar tarea
    await tarea.destroy();

    res.json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la tarea' });
  }
});

module.exports = router;
