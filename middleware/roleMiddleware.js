const jwt = require('jsonwebtoken');

exports.verifyRole = (roles) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(403).json({ message: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to authenticate token' });
            }
            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ message: 'You do not have the required role' });
            }
            req.userId = decoded.id;
            next();
        });
    };
};