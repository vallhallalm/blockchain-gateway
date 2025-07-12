import { routerFactory } from "../../../tools/routerFactory.js";
import controllers from "./controllers.js";

export const matchRouter = routerFactory([
    {
        method: "post",
        path: "/",
        controller: controllers.postMatchSummary,
    },
    {
        method: "get",
        path: "/:transactionHash",
        controller: controllers.getMatchSummary,
    },
]);
