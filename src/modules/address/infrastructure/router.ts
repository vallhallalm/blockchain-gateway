import { routerFactory } from "../../../tools/routerFactory";
import controllers from "./controllers";

export const addressRouter = routerFactory([
    {
        method: "post",
        path: "/",
        controller: controllers.postAddress,
    },
]);
