import {Router} from "express";
import {SubjectController} from "./controllers/SubjectController";
import {UserController} from "./controllers/UserController";
import {ProjectController} from "./controllers/projectController";
import {SystemController} from "./controllers/SystemController";

const routes = Router()

routes.get('/health', new SystemController().healthCheck)

routes.post('/subject', new SubjectController().create)

routes.post('/auth/register', new UserController().create)
routes.post('/auth/authenticate', new UserController().authenticate)
routes.post('/auth/forgot_password', new UserController().forgotPassword)
routes.post('/auth/reset_password', new UserController().resetPassword)

routes.get('/projects', new ProjectController().get)

export default routes