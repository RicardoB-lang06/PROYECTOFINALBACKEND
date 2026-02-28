const { DeduccionesRepository } = require('../repositories/deducciones.repository');
const { validarDeduccion } = require('../domain/deducciones.rules');
const { asyncHandler } = require('../utils/asyncHandler');

const { CurrencyIntegration } = require('../integration/currency.integration');

const repo = new DeduccionesRepository();

const create = asyncHandler(async (req, res) => {
    const monto_base = Number(req.body.monto_original || req.body.monto || req.body.monto_mxn || 0);
    const moneda_recibida = req.body.moneda || 'MXN';

    const validacion = validarDeduccion(req.body);
    if (!validacion.ok) return res.status(400).json({ error: validacion.error });

    let dataToSave = { ...validacion.data };
    console.log(`payload validado:`, dataToSave);

    if (moneda_recibida.toUpperCase() === 'USD') {
        try {
            console.log(`Consultando API para USD...`);
            const tipo_cambio = await CurrencyIntegration.getUsdToMxnRate();
            
            dataToSave.monto_mxn = monto_base * Number(tipo_cambio);
            console.log(`Éxito: $${monto_base} USD -> $${dataToSave.monto_mxn} MXN a TC: ${tipo_cambio}`);
        } catch (error) {
            console.warn(`Error en API: ${error.message}`);
            dataToSave.monto_mxn = monto_base * 18.50;
        }
    } else {
        dataToSave.monto_mxn = monto_base;
    }

    const nuevaDeduccion = await repo.create({
        user_id: req.user.id,
        ...dataToSave
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
    
    console.log(`Payload recibido para ID ${id}:`, req.body);
    let dataToUpdate = { ...req.body };

    const monto_base = Number(dataToUpdate.monto_original || dataToUpdate.monto || 0);

    if (dataToUpdate.moneda && dataToUpdate.moneda.toUpperCase() === 'USD' && monto_base > 0) {
        try {
            console.log(`Recalculando USD a MXN...`);
            const tipo_cambio = await CurrencyIntegration.getUsdToMxnRate();
            
            dataToUpdate.tipo_de_cambio_oficial = tipo_cambio;
            dataToUpdate.monto_mxn = monto_base * Number(tipo_cambio);
        } catch (error) {
            console.warn(`Error API: ${error.message}.`);
            dataToUpdate.tipo_de_cambio_oficial = 18.50;
            dataToUpdate.monto_mxn = monto_base * 18.50;
        }
    } else if (dataToUpdate.moneda && dataToUpdate.moneda.toUpperCase() === 'MXN' && monto_base > 0) {
        dataToUpdate.tipo_de_cambio_oficial = 1;
        dataToUpdate.monto_mxn = monto_base;
    }

    console.log(`Datos finales a guardar:`, dataToUpdate);

    const actualizado = await repo.update(id, req.user.id, dataToUpdate);
    
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