import { routerFactory } from "../../../tools/routerFactory.js";
import controllers from "./controllers.js";

export const addressRouter = routerFactory([
    {
        method: "post",
        path: "/",
        controller: controllers.postAddress,
    },
    {
        method: "get",
        path: "/:addressId/balance",
        controller: controllers.getAddressBalance,
    },
    {
        method: "get",
        path: "/:addressId/balance/nft",
        controller: controllers.getAddressNftBalance,
    },
    {
        method: "get",
        path: "/:addressId/balance/:token",
        controller: controllers.getAddressTokenBalance,
    },
    {
        method: "get",
        path: "/:addressId/token/:token/tokenId/:tokenId/validity",
        controller: controllers.checkTokenValidity,
    },
]);
