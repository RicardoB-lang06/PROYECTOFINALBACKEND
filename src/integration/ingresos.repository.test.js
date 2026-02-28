const { IngresosRepository } = require('../repositories/ingresos.repository');
const { pool } = require('../db');

describe('Integración: IngresosRepository con DB real', () => {
    const repo = new IngresosRepository();
    let ingresoId;
    let testUserId;

    beforeAll(async () => {
        const res = await pool.query(
            `INSERT INTO usuarios (primer_nombre, apellido_paterno, rfc, email, password_hash) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            ['TestUser', 'Repo', 'TEST000101XYZ', 'ingresos_test@mail.com', 'hash123']
        );
        testUserId = res.rows[0].id;
    });

    test('Create guarda un ingreso correctamente en la DB', async () => {
        const ingresoData = {
            user_id: testUserId,
            monto_original: 500.00,
            moneda: 'USD',
            tipo_de_cambio_oficial: 18.50,
            monto_mxn: 9250.00,
            fecha_recepcion: '2026-02-26',
            fuente: 'Freelance Software'
        };

        const created = await repo.create(ingresoData);
        ingresoId = created.id;

        expect(created).toBeTruthy();
        expect(Number(created.monto_mxn)).toBeCloseTo(9250.00);
        expect(created.fuente).toBe('Freelance Software');
    });

    test('Update modifica solo el campo fuente del ingreso', async () => {
        const updateData = { fuente: 'Proyecto Backend Actualizado' };
        
        const actualizado = await repo.update(ingresoId, testUserId, updateData);

        expect(actualizado.fuente).toBe('Proyecto Backend Actualizado');
        expect(Number(actualizado.monto_original)).toBeCloseTo(500.00);
    });

    afterAll(async () => {
        if (ingresoId) {
            await pool.query('DELETE FROM ingresos WHERE id = $1', [ingresoId]);
        }
        if (testUserId) {
            await pool.query('DELETE FROM usuarios WHERE id = $1', [testUserId]);
        }
        await pool.end();
    });
});