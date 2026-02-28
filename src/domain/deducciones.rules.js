function validarDeduccion({ concepto, monto_mxn, rfc_emisor, categoria, fecha_gasto }) {
    if (!concepto || typeof concepto !== 'string' || concepto.trim().length < 3 || concepto.trim().length > 255) {
        return { ok: false, error: 'El concepto es requerido y debe tener entre 3 y 255 caracteres' };
    }

    const monto = Number(monto_mxn);
    if (!Number.isFinite(monto) || monto <= 0 || monto > 1000000000) {
        return { ok: false, error: 'El monto de la deducción debe ser un número positivo válido' };
    }

    const rfcRegex = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    if (!rfc_emisor || typeof rfc_emisor !== 'string' || !rfcRegex.test(rfc_emisor.toUpperCase().trim())) {
        return { ok: false, error: 'El RFC del emisor no es válido (debe ser de 12 o 13 caracteres)' };
    }

    const categoriasValidas = ['Salud', 'Educación', 'Gastos Operativos', 'Otros'];
    const catLimpia = typeof categoria === 'string' ? categoria.trim() : '';
    const categoriaFinal = categoriasValidas.find(c => c.toLowerCase() === catLimpia.toLowerCase());
    
    if (!categoriaFinal) {
        return { ok: false, error: `Categoría no permitida. Opciones: ${categoriasValidas.join(', ')}` };
    }

    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fecha_gasto || typeof fecha_gasto !== 'string' || !fechaRegex.test(fecha_gasto.trim())) {
        return { ok: false, error: 'El formato de fecha es inválido. Debe ser YYYY-MM-DD' };
    }
    
    const partes = fecha_gasto.trim().split('-');
    const year = parseInt(partes[0], 10);
    const month = parseInt(partes[1], 10) - 1;
    const day = parseInt(partes[2], 10);
    const fechaObj = new Date(year, month, day);
    
    if (fechaObj.getFullYear() !== year || fechaObj.getMonth() !== month || fechaObj.getDate() !== day) {
        return { ok: false, error: 'La fecha proporcionada no existe en el calendario' };
    }
    if (fechaObj.getTime() > Date.now()) {
        return { ok: false, error: 'No puedes deducir un gasto con fecha futura' };
    }

    return {
        ok: true,
        data: {
            concepto: concepto.trim(),
            monto_mxn: monto,
            rfc_emisor: rfc_emisor.toUpperCase().trim(),
            categoria: categoriaFinal,
            fecha_gasto: fecha_gasto.trim()
        }
    };
}

module.exports = { validarDeduccion };