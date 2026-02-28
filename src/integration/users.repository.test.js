const { UsersRepository } = require('../repositories/users.repository');
const { pool } = require('../db');

describe('Integración: UsersRepository con DB real', () => {
  const repo = new UsersRepository();
  let userId;

  test('Create guarda un usuario en la DB real', async () => {
    const userData = {
      primer_nombre: 'Prueba',
      apellido_paterno: 'Test',
      apellido_materno: 'Jest',
      rfc: 'TEST990101XYZ',
      email: 'test_db@example.com',
      passwordHash: 'hash_falso_123',
      rol: 'user'
    };

    const created = await repo.create(userData);
    userId = created.id;

    expect(created).toBeTruthy();
    expect(Number(created.id)).toBeGreaterThan(0);
    expect(created.email).toBe('test_db@example.com');
    expect(created.rfc).toBe('TEST990101XYZ');
  });

  afterAll(async () => {
    if (userId) {
      await pool.query('DELETE FROM usuarios WHERE id = $1', [userId]);
    }
    await pool.end();
  });
});