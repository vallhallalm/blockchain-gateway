import addressRouter from "./modules/address";
import { Route } from "./route";
import { Config } from "./tools/config.utils";
import express, { Router } from "express";

const DEFAULT_PORT_TO_LISTEN = 8080;

async function main() {
    await Config.init("./conf.json");

    const app = express();

    app.use(express.json());

    const v1Router = Router();
    v1Router.use(Route.ADDRESS, addressRouter);
    app.use("/v1", v1Router);

    app.listen(Config.values.port || DEFAULT_PORT_TO_LISTEN);
    console.log(`listening on port ${Config.values.port || DEFAULT_PORT_TO_LISTEN}`);
}

main().catch((e) => console.error(e));
