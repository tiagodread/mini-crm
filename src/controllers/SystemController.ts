import {Request, Response} from "express";

export class SystemController {
    async healthCheck(req: Request, res: Response) {
        res.status(200).send({status: "OK"})
    }
}