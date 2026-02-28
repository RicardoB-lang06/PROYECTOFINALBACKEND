function validarIngreso({ monto_original, moneda, fecha_recepcion, fuente }) {
    if (typeof monto_original !== 'number' || isNaN(monto_original) || monto_original <= 0 || monto_original > 1000000000) {
        return { ok: false, error: 'El monto original debe ser un número válido, mayor a cero y dentro de un rango lógico.' };
    }

    if (!moneda || typeof moneda !== 'string') {
        return { ok: false, error: 'La moneda es requerida y debe ser texto.' };
    }
    const monedaLimpia = moneda.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(monedaLimpia)) {
        return { ok: false, error: 'Moneda inválida. Debe ser un código de 3 letras (ej. USD, MXN).' };
    }

    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fecha_recepcion || typeof fecha_recepcion !== 'string' || !fechaRegex.test(fecha_recepcion.trim())) {
        return { ok: false, error: 'El formato de fecha es inválido. Debe ser YYYY-MM-DD.' };
    }
    
    const partes = fecha_recepcion.trim().split('-');
    const year = parseInt(partes[0], 10);
    const month = parseInt(partes[1], 10) - 1;
    const day = parseInt(partes[2], 10);
    
    const fechaObj = new Date(year, month, day);
    
    if (fechaObj.getFullYear() !== year || fechaObj.getMonth() !== month || fechaObj.getDate() !== day) {
        return { ok: false, error: 'La fecha proporcionada no existe en el calendario.' };
    }
    
    if (fechaObj.getTime() > Date.now()) {
        return { ok: false, error: 'No puedes registrar un ingreso con fecha futura.' };
    }

    if (!fuente || typeof fuente !== 'string') {
        return { ok: false, error: 'La fuente del ingreso es requerida.' };
    }
    const fuenteLimpia = fuente.trim();
    if (fuenteLimpia.length < 5 || fuenteLimpia.length > 255) {
        return { ok: false, error: 'La fuente debe tener entre 5 y 255 caracteres.' };
    }

    return { 
        ok: true, 
        data: { 
            monto_original, 
            moneda: monedaLimpia, 
            fecha_recepcion: fecha_recepcion.trim(), 
            fuente: fuenteLimpia 
        } 
    };
}

module.exports = { validarIngreso };