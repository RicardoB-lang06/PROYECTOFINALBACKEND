const { DeduccionesRepository } = require('../repositories/deducciones.repository');
const { validarDeduccion } = require('../domain/deducciones.rules');
const { asyncHandler } = require('../utils/asyncHandler');

// 🚩 1. IMPORTAR LA INTEGRACIÓN DE DIVISAS (El héroe anónimo)
const { CurrencyIntegration } = require('../integration/currency.integration');

const repo = new DeduccionesRepository();

const create = asyncHandler(async (req, res) => {
    const validacion = validarDeduccion(req.body);
    if (!validacion.ok) return res.status(400).json({ error: validacion.error });

    let dataToSave = { ...validacion.data };
    console.log(`payload validado:`, dataToSave);

    const monto_base = Number(dataToSave.monto_original || dataToSave.monto || 0);

    if (dataToSave.moneda && dataToSave.moneda.toUpperCase() === 'USD') {
        try {
            console.log(`COonsultando API`);
            const tipo_cambio = await CurrencyIntegration.getUsdToMxnRate();
            
            dataToSave.tipo_de_cambio_oficial = tipo_cambio;
            dataToSave.monto_mxn = monto_base * Number(tipo_cambio);
            console.log(`Éxito: $${monto_base} ${dataToSave.monto_mxn} ${tipo_cambio}`);
        } catch (error) {
            console.warn(`Error en API: ${error.message}`);
            dataToSave.tipo_de_cambio_oficial = 18.50;
            dataToSave.monto_mxn = monto_base * 18.50;
        }
    } else {
        dataToSave.tipo_de_cambio_oficial = 1;
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