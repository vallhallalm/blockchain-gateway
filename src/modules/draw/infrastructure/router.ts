import { routerFactory } from "../../../tools/routerFactory.js";
import controllers from "./controllers.js";

export const drawRouter = routerFactory([
    {
        method: "post",
        path: "/",
        controller: controllers.postDraw,
    },
    {
        method: "get",
        path: "/:drawId",
        controller: controllers.getDrawParamsToVerify,
    },
]);
