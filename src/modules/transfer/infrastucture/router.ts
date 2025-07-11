import { routerFactory } from "../../../tools/routerFactory.js";
import controllers from "./controllers.js";

export const transferRouter = routerFactory([
    {
        method: "post",
        path: "/erc20",
        controller: controllers.transferErc20,
    },
    {
        method: "post",
        path: "/main",
        controller: controllers.transferMain,
    },
    {
        method: "post",
        path: "/nft",
        controller: controllers.transferNft,
    },
]);
