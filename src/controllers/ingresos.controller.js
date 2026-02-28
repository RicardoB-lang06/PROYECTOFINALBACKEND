const { IngresosRepository } = require('../repositories/ingresos.repository');
const { validarIngreso } = require('../domain/ingresos.rules');
const { asyncHandler } = require('../utils/asyncHandler');

const repo = new IngresosRepository();

const { CurrencyIntegration } = require('../integration/currency.integration');

const create = asyncHandler(async (req, res) => {
    const validacion = validarIngreso(req.body);
    if (!validacion.ok) return res.status(400).json({ error: validacion.error });

    const { monto_original, moneda, fuente, fecha_recepcion } = validacion.data;

    let tipo_cambio = 1;
    let monto_mxn = monto_original;

    if (moneda.toUpperCase() === 'USD') {
        try {
            tipo_cambio = await CurrencyIntegration.getUsdToMxnRate();
            monto_mxn = monto_original * tipo_cambio;
        } catch (error) {
            console.warn(`Error en API de divisas: ${error.message}. Usando tipo de cambio por defecto.`);
            tipo_cambio = 18.50;
            monto_mxn = monto_original * tipo_cambio;
        }
    }

    const nuevoIngreso = await repo.create({
        user_id: req.user.id,
        monto_original,
        moneda: moneda.toUpperCase(),
        tipo_de_cambio_oficial: tipo_cambio,
        monto_mxn,
        fecha_recepcion,
        fuente
    });

    res.status(201).json({ ok: true, data: nuevoIngreso });
});


const getAll = asyncHandler(async (req, res) => {
    const ingresos = await repo.findAllByUser(req.user.id);
    res.json({ ok: true, data: ingresos });
});

const getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ingreso = await repo.findById(id, req.user.id);
    
    if (!ingreso) {
        return res.status(404).json({ error: 'Ingreso no encontrado o no tienes permisos' });
    }
    
    res.json({ ok: true, data: ingreso });
});

const update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const actualizado = await repo.update(id, req.user.id, req.body);
    
    if (!actualizado) {
        return res.status(404).json({ error: 'Ingreso no encontrado o no tienes permisos' });
    }

    res.json({ ok: true, data: actualizado });
});

const remove = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const eliminado = await repo.delete(id, req.user.id);
    
    if (!eliminado) {
        return res.status(404).json({ error: 'Ingreso no encontrado o no tienes permisos' });
    }

    res.status(204).json({ ok: true, message: 'Ingreso eliminado correctamente' });
});

const getAllIngresos = asyncHandler(async (req, res) => {
    const user_id = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const offset = (page - 1) * limit;

    const resultado = await repo.findAllByUserPaginated(user_id, limit, offset);

    const totalPages = Math.ceil(resultado.totalRegistros / limit);

    res.json({
        ok: true,
        metadata: {
            totalRegistros: resultado.totalRegistros,
            totalPages: totalPages,
            currentPage: page,
            limit: limit
        },
        data: resultado.data
    });
});

module.exports = { create, getAll, getById, update, remove, getAllIngresos };