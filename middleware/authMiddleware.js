// authMiddleware.js

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        // Set req.user to the authenticated user
        req.user = req.session.user;
        return next();
    } else {
        return res.status(401).send('Acceso no autorizado. Inicia sesión.');
    }
}

function hasRole(role) {
    return (req, res, next) => {
        if (req.session.user && req.session.user.role === role) {
            if (role === 'business') {
                req.session.business_id = req.user.id; // Asegurarse de que 'id' es 'business_id'
            }
            return next();
        } else {
            return res.status(403).send('Acceso denegado. No tienes el rol adecuado.');
        }
    };
}

module.exports = { isAuthenticated, hasRole };