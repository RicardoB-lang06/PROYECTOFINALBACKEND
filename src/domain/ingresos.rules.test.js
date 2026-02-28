const { validarIngreso } = require('./ingresos.rules');

describe('Pruebas unitarias de IngresosRules - Cobertura Total', () => {

    test('Debería validar un ingreso correcto en USD', () => {
        const input = { 
            monto_original: 1500.50, 
            moneda: 'usd',
            fecha_recepcion: '2025-12-01', 
            fuente: 'Pago por desarrollo de software'
        };
        const res = validarIngreso(input);
        expect(res.ok).toBe(true);
        expect(res.data.moneda).toBe('USD');
    });

    test('Debería rechazar un monto negativo o cero', () => {
        const input = { monto_original: -100, moneda: 'USD', fecha_recepcion: '2025-12-01', fuente: 'Freelance' };
        const res = validarIngreso(input);
        expect(res.ok).toBe(false);
        expect(res.error).toBe('El monto original debe ser un número válido, mayor a cero y dentro de un rango lógico.');
    });

    test('Debería rechazar un monto que sea texto en lugar de número', () => {
        const input = { monto_original: "1000", moneda: 'USD', fecha_recepcion: '2025-12-01', fuente: 'Freelance' };
        const res = validarIngreso(input);
        expect(res.ok).toBe(false);
    });

    test('Debería rechazar una moneda de más de 3 letras', () => {
        const input = { monto_original: 1000, moneda: 'PESOS', fecha_recepcion: '2025-12-01', fuente: 'Freelance' };
        const res = validarIngreso(input);
        expect(res.ok).toBe(false);
        expect(res.error).toBe('Moneda inválida. Debe ser un código de 3 letras (ej. USD, MXN).');
    });

    test('Debería rechazar una moneda con números', () => {
        const input = { monto_original: 1000, moneda: 'US1', fecha_recepcion: '2025-12-01', fuente: 'Freelance' };
        const res = validarIngreso(input);
        expect(res.ok).toBe(false);
    });

    test('Debería rechazar una fecha con formato DD-MM-YYYY', () => {
        const input = { monto_original: 1000, moneda: 'USD', fecha_recepcion: '01-12-2025', fuente: 'Freelance' };
        const res = validarIngreso(input);
        expect(res.ok).toBe(false);
        expect(res.error).toBe('El formato de fecha es inválido. Debe ser YYYY-MM-DD.');
    });

    test('Debería rechazar una fecha inválida en el calendario (ej. 30 de febrero)', () => {
        const input = { monto_original: 1000, moneda: 'USD', fecha_recepcion: '2025-02-30', fuente: 'Freelance' };
        const res = validarIngreso(input);
        expect(res.ok).toBe(false);
        expect(res.error).toBe('La fecha proporcionada no existe en el calendario.');
    });

    test('Debería rechazar una fecha en el futuro', () => {
        const input = { monto_original: 1000, moneda: 'USD', fecha_recepcion: '2050-01-01', fuente: 'Freelance' };
        const res = validarIngreso(input);
        expect(res.ok).toBe(false);
        expect(res.error).toBe('No puedes registrar un ingreso con fecha futura.');
    });

    test('Debería rechazar una fuente demasiado corta', () => {
        const input = { monto_original: 1000, moneda: 'USD', fecha_recepcion: '2025-12-01', fuente: 'OXXO' }; // 4 letras
        const res = validarIngreso(input);
        expect(res.ok).toBe(false);
        expect(res.error).toBe('La fuente debe tener entre 5 y 255 caracteres.');
    });

});