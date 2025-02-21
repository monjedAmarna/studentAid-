import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import cors from 'cors';
import allowCredentials from './middleware/allowcredentials.middleware.js';
import express, { json, urlencoded } from 'express';
import APIRoutes from "./api.js";
import { OK } from './constants/status.constants.js';
import handleErrors from './utils/errors.js';
import corsOptions from './config/cors.config.js';



const app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//cookie parser
app.use(cookieParser())

// Cross origin configuration 
app.use(cors(corsOptions));
app.use(allowCredentials)

app.use(json())
app.use(urlencoded({
    extended: true
}))

app.use("/health", (req, res) => {
    return res.sendStatus(OK);
});

app.use("/api", APIRoutes);

app.use(handleErrors)

export default app