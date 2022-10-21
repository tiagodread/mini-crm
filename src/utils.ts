const jwt = require('jsonwebtoken');
const authConfig = require('./config/auth.json');

export default function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
}