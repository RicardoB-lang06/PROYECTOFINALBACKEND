const { DeduccionesRepository } = require('../repositories/deducciones.repository');
const { validarDeduccion } = require('../domain/deducciones.rules');
const { asyncHandler } = require('../utils/asyncHandler');

const repo = new DeduccionesRepository();

const create = asyncHandler(async (req, res) => {
    const validacion = validarDeduccion(req.body);
    if (!validacion.ok) return res.status(400).json({ error: validacion.error });

    const nuevaDeduccion = await repo.create({
        user_id: req.user.id,
        ...validacion.data
    });

    res.status(201).json({ ok: true, data: nuevaDeduccion });
});

const getAll = asyncHandler(async (req, res) => {
    const deducciones = await repo.findAllByUser(req.user.id);
    res.json({ ok: true, data: deducciones });
});

const getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deduccion = await repo.findById(id, req.user.id);
    
    if (!deduccion) {
        return res.status(404).json({ error: 'Deducción no encontrada o sin permisos' });
    }
    
    res.json({ ok: true, data: deduccion });
});

const update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const actualizado = await repo.update(id, req.user.id, req.body);
    
    if (!actualizado) {
        return res.status(404).json({ error: 'Deducción no encontrada o sin permisos para actualizar' });
    }

    res.json({ ok: true, data: actualizado });
});

const remove = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const eliminado = await repo.delete(id, req.user.id);
    
    if (!eliminado) {
        return res.status(404).json({ error: 'Deducción no encontrada o sin permisos para eliminar' });
    }

    res.status(204).json({ ok: true, message: 'Deducción eliminada correctamente' });
});

module.exports = { create, getAll, getById, update, remove };