import addressRouter from "./modules/address/index.js";
import { Route } from "./route.js";
import { Config } from "./tools/config.utils.js";
import express, { Router } from "express";
import { AbiCache } from "./tools/abi.utils.js";
import { KeyCache } from "./tools/keyCache.js";
import transferRouter from "./modules/transfer/index.js";

const DEFAULT_PORT_TO_LISTEN = 8080;

async function main() {
    await Config.init("./conf.json");
    await AbiCache.init("./abi");
    await KeyCache.init("./addresses");

    const app = express();

    app.use(express.json());

    const v1Router = Router();
    v1Router.use(Route.ADDRESS, addressRouter).use(Route.TRANSFER, transferRouter);
    app.use("/v1", v1Router);

    app.listen(Config.values.port || DEFAULT_PORT_TO_LISTEN);
    console.log(`listening on port ${Config.values.port || DEFAULT_PORT_TO_LISTEN}`);
}

main().catch((e) => console.error(e));
