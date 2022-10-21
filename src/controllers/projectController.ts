import {Application, Request, Response} from "express";
import {projectRepository} from "../repositories/projectRepository";

const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req: Request, res: Response) => {
    res.send({ok: true});
});

export class ProjectController {
    async get(req: Request, res: Response) {
        res.send({ok: true});
    }
}