const express = require('express');
const router = express.Router();
const Comentario = require('../models/comentario');
const Tarea = require('../models/tarea');
const Proyecto = require('../models/Proyecto'); 

router.get('/:proyectoId/tareas/:tareaId/comentarios', async (req, res) => {
  try {
    const proyectoId = parseInt(req.params.proyectoId); // ID del proyecto
    const tareaId = parseInt(req.params.tareaId); // ID de la tarea

    if (isNaN(proyectoId) || isNaN(tareaId)) {
      return res.status(400).json({ message: 'ID del proyecto o tarea inválido' });
    }

    // Validar si el proyecto existe
    const proyecto = await Proyecto.findByPk(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Validar si la tarea existe y pertenece al proyecto
    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea || tarea.proyecto_id !== proyectoId) {
      return res.status(404).json({ message: 'Tarea no encontrada en este proyecto' });
    }

    // Traer los comentarios asociados a la tarea
    const comentarios = await Comentario.findAll({
      where: { tarea_id: tareaId }
    });

    if (comentarios.length === 0) {
      return res.status(404).json({ message: 'No hay comentarios para esta tarea' });
    }

    res.json(comentarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los comentarios de la tarea' });
  }
});
// Obtener un comentario por su ID
router.get('/:proyectoId/tareas/:tareaId/comentarios/:comentarioId', async (req, res) => {
  try {
    const proyectoId = parseInt(req.params.proyectoId);
    const tareaId = parseInt(req.params.tareaId);
    const comentarioId = parseInt(req.params.comentarioId);

    if (isNaN(proyectoId) || isNaN(tareaId) || isNaN(comentarioId)) {
      return res.status(400).json({ message: 'ID del proyecto, tarea o comentario inválido' });
    }

    const proyecto = await Proyecto.findByPk(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea || tarea.proyecto_id !== proyectoId) {
      return res.status(404).json({ message: 'Tarea no encontrada en este proyecto' });
    }

    const comentario = await Comentario.findByPk(comentarioId);
    if (!comentario || comentario.tarea_id !== tareaId) {
      return res.status(404).json({ message: 'Comentario no encontrado en esta tarea' });
    }

    res.json(comentario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el comentario' });
  }
});
// Actualizar un comentario
router.put('/:proyectoId/tareas/:tareaId/comentarios/:comentarioId', async (req, res) => {
  try {
    const proyectoId = parseInt(req.params.proyectoId);
    const tareaId = parseInt(req.params.tareaId);
    const comentarioId = parseInt(req.params.comentarioId);
    const { texto } = req.body;

    if (isNaN(proyectoId) || isNaN(tareaId) || isNaN(comentarioId)) {
      return res.status(400).json({ message: 'ID del proyecto, tarea o comentario inválido' });
    }

    const proyecto = await Proyecto.findByPk(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea || tarea.proyecto_id !== proyectoId) {
      return res.status(404).json({ message: 'Tarea no encontrada en este proyecto' });
    }

    const comentario = await Comentario.findByPk(comentarioId);
    if (!comentario || comentario.tarea_id !== tareaId) {
      return res.status(404).json({ message: 'Comentario no encontrado en esta tarea' });
    }

    comentario.texto = texto;
    await comentario.save();

    res.json(comentario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el comentario' });
  }
});
// Eliminar un comentario
router.delete('/:proyectoId/tareas/:tareaId/comentarios/:comentarioId', async (req, res) => {
  try {
    const proyectoId = parseInt(req.params.proyectoId);
    const tareaId = parseInt(req.params.tareaId);
    const comentarioId = parseInt(req.params.comentarioId);

    if (isNaN(proyectoId) || isNaN(tareaId) || isNaN(comentarioId)) {
      return res.status(400).json({ message: 'ID del proyecto, tarea o comentario inválido' });
    }

    const proyecto = await Proyecto.findByPk(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea || tarea.proyecto_id !== proyectoId) {
      return res.status(404).json({ message: 'Tarea no encontrada en este proyecto' });
    }

    const comentario = await Comentario.findByPk(comentarioId);
    if (!comentario || comentario.tarea_id !== tareaId) {
      return res.status(404).json({ message: 'Comentario no encontrado en esta tarea' });
    }

    await comentario.destroy();

    res.json({ message: 'Comentario eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el comentario' });
  }
});
// Insertar un comentario
router.post('/:proyectoId/tareas/:tareaId/comentarios', async (req, res) => {
  try {
    const proyectoId = parseInt(req.params.proyectoId);
    const tareaId = parseInt(req.params.tareaId);
    const { texto } = req.body;

    if (isNaN(proyectoId) || isNaN(tareaId)) {
      return res.status(400).json({ message: 'ID del proyecto o tarea inválido' });
    }

    const proyecto = await Proyecto.findByPk(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea || tarea.proyecto_id !== proyectoId) {
      return res.status(404).json({ message: 'Tarea no encontrada en este proyecto' });
    }

    const comentario = await Comentario.create({
      tarea_id: tareaId,
      texto
    });

    res.status(201).json(comentario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el comentario' });
  }
});

module.exports = router;
