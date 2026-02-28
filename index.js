const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { pool } = require('./src/db');
const { authMiddleware } = require('./src/auth');
const { router: usersRouter } = require('./src/routes/users.routes');
const { router: ingresosRouter } = require('./src/routes/ingresos.routes');
const { router: deduccionesRouter } = require('./src/routes/deducciones.routes');
const { router: taxRouter } = require('./src/routes/tax.routes');

const PORT = process.env.PORT || 10000;
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Demasiadas solicitudes, por favor intente de nuevo más tarde.'
});

app.use(limiter);

const allowed = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://dfs-front.vercel.app'
];

app.use(cors({
  origin: function (origin, cb) {
    if (!origin) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error('CORS bloqueado: ' + origin));
  }
}));

app.use(express.json()); 

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('API OK');
});

app.get('/health/db', async (req, res) => {
  try {
    const r = await pool.query('select 1 as ok');
    return res.json({ ok: true, db: r.rows[0].ok });
  } catch (err) {
    console.log('DB Error', err.message);
    return res.status(500).json({ ok: false, error: 'DB no disponible' });
  }
});

app.use('/users', usersRouter);
app.use('/ingresos', ingresosRouter);
app.use('/deducciones', deduccionesRouter);
app.use('/impuestos', taxRouter);

app.get('/privado', authMiddleware, (req, res) => {
  return res.json({
    ok: true,
    user: req.user
  });
});

const { errorHandler } = require('./src/middleware/error.middleware');
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo ${PORT}`);
});