function errorHandler(err, req, res, next) {
  console.log('Error detectado:', err.message);

  return res.status(500).json({error: 'Error Interno del Servidor'})
}

module.exports = { errorHandler }