import express from 'express'
import {AppDataSource} from "./data-source";
import routes from "./routes";
import bodyParser from "body-parser";

AppDataSource.initialize().then(() => {
    const app = express()
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: false}))
    app.use(routes)
    app.locals.layout = false;
    return app.listen(process.env.APP_PORT)
})