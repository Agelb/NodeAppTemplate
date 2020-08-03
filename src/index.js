import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import expressPinoLogger from "express-pino-logger";

const app = express();
app.use(expressPinoLogger);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());

app.listen(8080);
