const { pool } = require('../db');

class UsersRepository {
    async create({ primer_nombre, apellido_paterno, apellido_materno, rfc, email, passwordHash, rol }) {
        const r = await pool.query(
            `INSERT INTO usuarios 
            (primer_nombre, apellido_paterno, apellido_materno, rfc, email, password_hash, rol) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id, primer_nombre, email, rfc, rol`,
            [primer_nombre, apellido_paterno, apellido_materno, rfc, email, passwordHash, rol]
        );
        return r.rows[0];
    }

    async findByEmail(email) {
        const r = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );
        return r.rows[0] || null;
    }

    async findAll() {
        const r = await pool.query(
            `SELECT id, primer_nombre, apellido_paterno, apellido_materno, rfc, email, rol 
             FROM usuarios 
             ORDER BY id DESC`
        );
        return r.rows;
    }

    async findById(id) {
        const r = await pool.query(
            `SELECT id, primer_nombre, apellido_paterno, apellido_materno, rfc, email, rol 
             FROM usuarios 
             WHERE id = $1`,
            [id]
        );
        return r.rows[0] || null;
    }

    async update(id, data) {
        const r = await pool.query(
            `UPDATE usuarios SET 
                primer_nombre = COALESCE($1, primer_nombre),
                apellido_paterno = COALESCE($2, apellido_paterno),
                apellido_materno = COALESCE($3, apellido_materno),
                rfc = COALESCE($4, rfc),
                email = COALESCE($5, email),
                rol = COALESCE($6, rol)
             WHERE id = $7 
             RETURNING id, primer_nombre, apellido_paterno, apellido_materno, rfc, email, rol`,
            [
                data.primer_nombre ?? null,
                data.apellido_paterno ?? null,
                data.apellido_materno ?? null,
                data.rfc ?? null,
                data.email ?? null,
                data.rol ?? null,
                id
            ]
        );
        return r.rows[0] || null;
    }

    async delete(id) {
        const r = await pool.query(
            'DELETE FROM usuarios WHERE id = $1 RETURNING id',
            [id]
        );
        return r.rows[0] || null;
    }
}

module.exports = { UsersRepository };