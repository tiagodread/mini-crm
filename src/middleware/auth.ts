import {NextFunction, Request, Response} from "express";

const jtw = require('jsonwebtoken');
const authConfig = require('../config/auth.json');

module.exports = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).send({error: 'No auth token provided'});

    const parts = authHeader.split(' ');

    if (parts.length !== 2) return res.status(401).send({error: 'Token error'});

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) return res.status(401).send({error: 'Token bad formatted'});

    return jtw.verify(token, authConfig.secret, (err: any, decoded: any) => {
        if (err) return res.status(401).send({error: 'Token Invalid'});
        console.log(token)
        // @ts-ignore
        req.userId = decoded.id;
        return next();
    });
};
