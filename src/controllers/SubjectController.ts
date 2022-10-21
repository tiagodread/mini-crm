import {Request, Response} from "express";
import {subjectRepository} from "../repositories/subjectRepository";

export class SubjectController {
    async create(req: Request, res: Response) {
        const {name} = req.body

        if (!name) {
            return res.status(400).json({"error": "missing required field name"})
        }

        try {
            const subject = subjectRepository.create({name})
            await subjectRepository.save(subject)
            res.status(201).json(subject)
            console.log(subject)
        } catch (err) {
            console.log(err)
            res.status(500).json({"error": err})
        }
    }
}