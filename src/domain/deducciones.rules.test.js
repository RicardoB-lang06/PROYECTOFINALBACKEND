const { validarDeduccion } = require('./deducciones.rules');

describe('Pruebas unitarias de DeduccionesRules - Cobertura Total', () => {


    test('Debería validar una deducción de Persona Física y mantener las llaves oficiales', () => {
        const input = {
            concepto: 'Consulta Médica General',
            monto_mxn: 1500.50,
            rfc_emisor: 'VABR950101XYZ', 
            categoria: ' salud ', 
            fecha_gasto: '2025-12-15'
        };
        const res = validarDeduccion(input);
        
        expect(res.ok).toBe(true);
        expect(res.data.monto_mxn).toBe(1500.50);
        expect(res.data.fecha_gasto).toBe('2025-12-15');
        expect(res.data.categoria).toBe('Salud');
    });

    test('Debería validar una deducción de Persona Moral (Empresa)', () => {
        const input = {
            concepto: 'Compra de Servidor AWS',
            monto_mxn: 5000,
            rfc_emisor: 'ABC120101XYZ',
            categoria: 'Gastos Operativos',
            fecha_gasto: '2025-11-20'
        };
        const res = validarDeduccion(input);
        
        expect(res.ok).toBe(true);
        expect(res.data.rfc_emisor).toBe('ABC120101XYZ');
    });


    test('Debería rechazar un concepto muy corto', () => {
        const input = { concepto: 'PC', monto_mxn: 100, rfc_emisor: 'ABC120101XYZ', categoria: 'Otros', fecha_gasto: '2025-12-01' };
        const res = validarDeduccion(input);
        expect(res.ok).toBe(false);
        expect(res.error).toBe('El concepto es requerido y debe tener entre 3 y 255 caracteres');
    });

    test('Debería rechazar un monto negativo o cero', () => {
        const input = { concepto: 'Gasto', monto_mxn: -50, rfc_emisor: 'ABC120101XYZ', categoria: 'Otros', fecha_gasto: '2025-12-01' };
        const res = validarDeduccion(input);
        expect(res.ok).toBe(false);
        expect(res.error).toBe('El monto de la deducción debe ser un número positivo válido');
    });

    test('Debería rechazar un RFC con formato incorrecto', () => {
        const input = { concepto: 'Gasto', monto_mxn: 100, rfc_emisor: 'RFC_MALO', categoria: 'Otros', fecha_gasto: '2025-12-01' };
        const res = validarDeduccion(input);
        expect(res.ok).toBe(false);
        expect(res.error).toBe('El RFC del emisor no es válido (debe ser de 12 o 13 caracteres)');
    });

    test('Debería rechazar una categoría inventada', () => {
        const input = { concepto: 'Gasto', monto_mxn: 100, rfc_emisor: 'ABC120101XYZ', categoria: 'Comida Chatarra', fecha_gasto: '2025-12-01' };
        const res = validarDeduccion(input);
        expect(res.ok).toBe(false);
        expect(res.error).toContain('Categoría no permitida');
    });


    test('Debería rechazar una fecha con formato inválido', () => {
        const input = { concepto: 'Gasto', monto_mxn: 100, rfc_emisor: 'ABC120101XYZ', categoria: 'Otros', fecha_gasto: '01-12-2025' };
        const res = validarDeduccion(input);
        expect(res.ok).toBe(false);
        expect(res.error).toBe('El formato de fecha es inválido. Debe ser YYYY-MM-DD');
    });

    test('Debería rechazar una fecha inexistente en el calendario (30 de febrero)', () => {
        const input = { concepto: 'Gasto', monto_mxn: 100, rfc_emisor: 'ABC120101XYZ', categoria: 'Otros', fecha_gasto: '2025-02-30' };
        const res = validarDeduccion(input);
        expect(res.ok).toBe(false);
        expect(res.error).toBe('La fecha proporcionada no existe en el calendario');
    });

    test('Debería rechazar una fecha en el futuro', () => {
        const input = { concepto: 'Gasto', monto_mxn: 100, rfc_emisor: 'ABC120101XYZ', categoria: 'Otros', fecha_gasto: '2050-01-01' };
        const res = validarDeduccion(input);
        expect(res.ok).toBe(false);
        expect(res.error).toBe('No puedes deducir un gasto con fecha futura');
    });

});