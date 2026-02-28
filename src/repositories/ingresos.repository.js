const { pool } = require('../db');

class IngresosRepository {
    async create({ user_id, monto_original, moneda, tipo_de_cambio_oficial, monto_mxn, fecha_recepcion, fuente }) {
        const r = await pool.query(
            'INSERT INTO ingresos (user_id, monto_original, moneda, tipo_de_cambio_oficial, monto_mxn, fecha_recepcion, fuente) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [user_id, monto_original, moneda, tipo_de_cambio_oficial, monto_mxn, fecha_recepcion, fuente]
        );
        return r.rows[0];
    }

    async findById(id, user_id) {
        const r = await pool.query(
            'SELECT * FROM ingresos WHERE id = $1 AND user_id = $2',
            [id, user_id]
        );
        return r.rows[0] || null;
    }

    async findAllByUserPaginated(user_id, limit, offset) {
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM ingresos WHERE user_id = $1',
            [user_id]
        );
        const totalRegistros = parseInt(countResult.rows[0].count, 10);

        const r = await pool.query(
            `SELECT * FROM ingresos 
             WHERE user_id = $1 
             ORDER BY fecha_recepcion DESC 
             LIMIT $2 OFFSET $3`,
            [user_id, limit, offset]
        );

        return {
            totalRegistros,
            data: r.rows
        };
    }

    async findAllByUser(user_id) {
        const r = await pool.query(
            'SELECT * FROM ingresos WHERE user_id = $1 ORDER BY fecha_recepcion DESC',
            [user_id]
        );
        return r.rows;
    }
    async findByMonthAndYear(user_id, mes, año) {
        const r = await pool.query(
            `SELECT * FROM ingresos 
             WHERE user_id = $1 
             AND EXTRACT(MONTH FROM fecha_recepcion) = $2 
             AND EXTRACT(YEAR FROM fecha_recepcion) = $3`,
            [user_id, mes, año]
        );
        return r.rows;
    }

    async update(id, user_id, data) {
        const r = await pool.query(
            `UPDATE ingresos SET 
                monto_original = COALESCE($1, monto_original), 
                moneda = COALESCE($2, moneda), 
                tipo_de_cambio_oficial = COALESCE($3, tipo_de_cambio_oficial), 
                monto_mxn = COALESCE($4, monto_mxn), 
                fecha_recepcion = COALESCE($5, fecha_recepcion), 
                fuente = COALESCE($6, fuente) 
             WHERE id = $7 AND user_id = $8 RETURNING *`,
            [
                data.monto_original ?? null,
                data.moneda ?? null,
                data.tipo_de_cambio_oficial ?? null,
                data.monto_mxn ?? null,
                data.fecha_recepcion ?? null,
                data.fuente ?? null,
                id,
                user_id
            ]
        );
        return r.rows[0] || null;
    }

    async delete(id, user_id) {
        const r = await pool.query(
            'DELETE FROM ingresos WHERE id = $1 AND user_id = $2 RETURNING id', 
            [id, user_id]
        );
        return r.rows[0] || null;
    }
}

module.exports = { IngresosRepository };