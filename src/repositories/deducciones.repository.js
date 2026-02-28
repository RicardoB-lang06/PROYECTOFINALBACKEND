const { pool } = require('../db');

class DeduccionesRepository {
    async create({ user_id, monto_mxn, fecha_gasto, concepto, rfc_emisor, categoria }) {
        const r = await pool.query(
            `INSERT INTO deducciones 
            (user_id, monto_mxn, fecha_gasto, concepto, rfc_emisor, categoria) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
            [user_id, monto_mxn, fecha_gasto, concepto, rfc_emisor, categoria]
        );
        return r.rows[0];
    }

    async findById(id, user_id) {
        const r = await pool.query(
            'SELECT * FROM deducciones WHERE id = $1 AND user_id = $2',
            [id, user_id]
        );
        return r.rows[0] || null;
    }

    async findAllByUser(user_id) {
        const r = await pool.query(
            'SELECT * FROM deducciones WHERE user_id = $1 ORDER BY fecha_gasto DESC',
            [user_id]
        );
        return r.rows;
    }
    async findByMonthAndYear(user_id, mes, año) {
        const r = await pool.query(
            `SELECT * FROM deducciones 
             WHERE user_id = $1 
             AND EXTRACT(MONTH FROM fecha_gasto) = $2 
             AND EXTRACT(YEAR FROM fecha_gasto) = $3`,
            [user_id, mes, año]
        );
        return r.rows;
    }

    async update(id, user_id, data) {
        const r = await pool.query(
            `UPDATE deducciones SET 
                monto_mxn = COALESCE($1, monto_mxn), 
                fecha_gasto = COALESCE($2, fecha_gasto), 
                concepto = COALESCE($3, concepto),
                rfc_emisor = COALESCE($4, rfc_emisor),
                categoria = COALESCE($5, categoria)
             WHERE id = $6 AND user_id = $7 
             RETURNING *`,
            [
                data.monto_mxn ?? null,
                data.fecha_gasto ?? null,
                data.concepto ?? null,
                data.rfc_emisor ?? null,
                data.categoria ?? null,
                id,
                user_id
            ]
        );
        return r.rows[0] || null;
    }

    async delete(id, user_id) {
        const r = await pool.query(
            'DELETE FROM deducciones WHERE id = $1 AND user_id = $2 RETURNING id', 
            [id, user_id]
        );
        return r.rows[0] || null;
    }
}

module.exports = { DeduccionesRepository };