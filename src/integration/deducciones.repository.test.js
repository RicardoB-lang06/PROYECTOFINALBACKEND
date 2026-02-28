const { DeduccionesRepository } = require('../repositories/deducciones.repository');
const { pool } = require('../db');

describe('Integración: DeduccionesRepository con DB real', () => {
    const repo = new DeduccionesRepository();
    let deduccionId;
    let testUserId;

    beforeAll(async () => {
        const res = await pool.query(
            `INSERT INTO usuarios (primer_nombre, apellido_paterno, rfc, email, password_hash) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            ['Usuario', 'Pruebas', 'TEST000101XYZ', 'deducciones_repo@mail.com', 'hash123']
        );
        testUserId = res.rows[0].id;
    });

    test('Create: Guarda una deducción correctamente en la DB', async () => {
        const deduccionData = {
            user_id: testUserId,
            monto_mxn: 1500.50,
            fecha_gasto: '2026-02-27',
            concepto: 'Silla ergonómica para home office',
            rfc_emisor: 'OFFI990101XYZ',
            categoria: 'Gastos Operativos'
        };

        const created = await repo.create(deduccionData);
        deduccionId = created.id;

        expect(created).toBeTruthy();
        expect(Number(created.monto_mxn)).toBeCloseTo(1500.50);
        expect(created.concepto).toBe('Silla ergonómica para home office');
        expect(created.categoria).toBe('Gastos Operativos');
    });

    test('FindById: Obtiene la deducción asegurando que pertenece al usuario', async () => {
        const deduccion = await repo.findById(deduccionId, testUserId);
        
        expect(deduccion).toBeTruthy();
        expect(deduccion.id).toBe(deduccionId);
        expect(deduccion.rfc_emisor).toBe('OFFI990101XYZ');
    });

    test('FindAllByUser: Obtiene todas las deducciones del usuario ordenadas', async () => {
        const deducciones = await repo.findAllByUser(testUserId);
        
        expect(Array.isArray(deducciones)).toBe(true);
        expect(deducciones.length).toBeGreaterThanOrEqual(1);
        expect(deducciones[0].concepto).toBe('Silla ergonómica para home office');
    });

    test('Update: Modifica campos específicos usando COALESCE', async () => {
        const updateData = { 
            concepto: 'Silla ergonómica premium', 
            monto_mxn: 2000.00 
        };
        
        const actualizado = await repo.update(deduccionId, testUserId, updateData);

        expect(actualizado.concepto).toBe('Silla ergonómica premium');
        expect(Number(actualizado.monto_mxn)).toBeCloseTo(2000.00);
        expect(actualizado.categoria).toBe('Gastos Operativos');
    });

    test('Delete: Elimina la deducción de la DB', async () => {
        const eliminado = await repo.delete(deduccionId, testUserId);
        expect(eliminado.id).toBe(deduccionId);

        const busqueda = await repo.findById(deduccionId, testUserId);
        expect(busqueda).toBeNull();
    });

    afterAll(async () => {
        if (deduccionId) {
            await pool.query('DELETE FROM deducciones WHERE id = $1', [deduccionId]);
        }
        if (testUserId) {
            await pool.query('DELETE FROM usuarios WHERE id = $1', [testUserId]);
        }
        await pool.end();
    });
});