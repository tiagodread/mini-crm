import {Request, Response} from "express";
import {userRepository} from "../repositories/userRepository";
import generateToken from "../utils";
import * as bcrypt from 'bcryptjs';
import {User} from "../entities/User";

const mailer = require('../modules/mailer');
const crypto = require('crypto');


export class UserController {
    async create(req: Request, res: Response) {
        const {name, email, password} = req.body

        if (!name || !email || !password) {
            return res.status(400).send({error: "missing required fields"})
        }

        try {
            const alreadyRegistered = await userRepository.createQueryBuilder('user').where("user.email = :email", {email}).getOne()
            if (alreadyRegistered) return res.status(400).send({error: 'Email already exists'})

            const user = userRepository.create({name, email, password})
            await userRepository.save(user)
            const token = generateToken({id: user.id})
            res.status(201).send({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    create_at: user.createdAt,
                    updated_at: user.updatedAt
                },
                token
            })
            console.log(`Created user ${user.email}`)
        } catch (err) {
            console.log(err)
            res.status(400).send({error: err})
        }
    }

    async authenticate(req: Request, res: Response) {
        const {email, password} = req.body;
        const user = await userRepository.createQueryBuilder('user').where("user.email = :email", {email}).addSelect("user.password").getOne()
        if (!user) return res.status(401).send({error: 'Invalid email or password'});

        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).send({error: 'Invalid email or password'});
        }

        return res.send({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                create_at: user.createdAt,
                updated_at: user.updatedAt
            },
            token: generateToken({id: user.id}),
        });
    }

    async forgotPassword(req: Request, res: Response) {
        const {email} = req.body;
        try {
            const user = await userRepository.createQueryBuilder('user').where("user.email = :email", {email}).addSelect("user.password").getOne()
            if (!user) {
                return res.status(401).send({error: 'Invalid email or password'});
            }

            const token = crypto.randomBytes(20).toString('HEX');
            const tokenExpires = new Date();
            tokenExpires.setHours(tokenExpires.getHours() + 1);

            await userRepository.createQueryBuilder('user').update(User).set({
                passwordResetToken: token,
                passwordResetExpires: tokenExpires
            }).where("id = :id", {id: user.id}).execute()

            mailer.sendMail({
                subject: 'Redefina sua senha',
                to: email,
                from: 'tiago.goes@gmail.com',
                template: 'auth/forgot_password',
                context: {token},
            }, (err: any) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send({error: 'Cannot send forgot password email'});
                }
                return res.send();
            });
        } catch (e) {
            console.log(e);
            return res.status(400).send({error: 'error on forgot password, try again'});
        }
    }

    async resetPassword(req: Request, res: Response) {
        const {email, token, password} = req.body;

        try {
            const user = await userRepository.createQueryBuilder('user')
                .where("user.email = :email", {email})
                .addSelect("user.passwordResetToken")
                .addSelect('user.passwordResetExpires')
                .getOne()
            if (!user) return res.status(400).send({error: 'User not found'});

            console.log(token)
            console.log(user.passwordResetToken)


            if (token !== user.passwordResetToken) {
                console.log('blaaa')
                return res.status(400).send({error: 'Token invalid'});
            }

            const now = new Date();
            if (now > user.passwordResetExpires) {
                return res.status(400).send({error: 'Token expired'});
            }

            const newHashedPass = await bcrypt.hash(password, 10)
            await userRepository.createQueryBuilder('user').update(User).set({
                password: newHashedPass
            }).where("id = :id", {id: user.id}).execute()

            res.send();
        } catch (e) {
            console.log(e);
            return res.status(400).send({error: 'error resetting account, try again'});
        }
    }
}