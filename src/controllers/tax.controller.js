const {pool} = require('../db');
const { calcularImpuestosRESICO } = require('../domain/tax.service');

const getSummary = async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const userId = req.user.id;

    const queryIngresos = `
      SELECT monto_mxn, moneda 
      FROM ingresos 
      WHERE user_id = $1 
      AND EXTRACT(MONTH FROM fecha_recepcion) = $2 
      AND EXTRACT(YEAR FROM fecha_recepcion) = $3
    `;
    
    const queryDeducciones = `
      SELECT monto_mxn 
      FROM deducciones 
      WHERE user_id = $1 
      AND EXTRACT(MONTH FROM fecha_gasto) = $2 
      AND EXTRACT(YEAR FROM fecha_gasto) = $3
    `;

    const [ingRes, dedRes] = await Promise.all([
      pool.query(queryIngresos, [userId, mes, anio]),
      pool.query(queryDeducciones, [userId, mes, anio])
    ]);

    const resultado = calcularImpuestosRESICO(ingRes.rows, dedRes.rows);

    res.json(resultado);

  } catch (error) {
    console.error("Error en el motor fiscal:", error);
    res.status(500).json({ ok: false, error: "Error al calcular datos reales" });
  }
};

module.exports = { 
  getSummary,
  calcular: (req, res) => res.json({ msg: "API Online" }) 
};