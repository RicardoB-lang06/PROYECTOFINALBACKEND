const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.rol !== 'admin') {
        return res.status(403).json({ 
            error: 'Acceso denegado. Se requieren permisos de Administrador.' 
        });
    }
    
    next();
};

module.exports = { adminMiddleware };