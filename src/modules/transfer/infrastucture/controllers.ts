import zod from "zod";
import { controllerFactory } from "../../../tools/controllerFactory.js";
import TransferService from "../domain/services.js";

const transferErc20 = controllerFactory(
    {
        body: zod.object({
            from: zod.string(),
            to: zod.string(),
            amount: zod.number(),
            token: zod.string(),
        }),
    },
    ({ body: { from, to, amount, token } }) =>
        TransferService.transferErc20(from, to, amount, token)
);

const transferMain = controllerFactory(
    {
        body: zod.object({
            from: zod.string(),
            to: zod.string(),
            amount: zod.number(),
        }),
    },
    ({ body: { from, to, amount } }) => TransferService.transferMain(from, to, amount)
);

const transferNft = controllerFactory(
    {
        body: zod.object({
            from: zod.string(),
            to: zod.string(),
            amount: zod.number(),
            token: zod.string(),
            tokenId: zod.number(),
        }),
    },
    ({ body: { from, to, amount, token, tokenId } }) =>
        TransferService.transferNft(from, to, amount, token, tokenId)
);

export default {
    transferErc20,
    transferMain,
    transferNft,
};
