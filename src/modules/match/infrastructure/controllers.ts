import zod from "zod";
import { controllerFactory } from "../../../tools/controllerFactory.js";
import MatchService from "../domain/services.js";

const postMatchSummary = controllerFactory(
    {
        body: zod.object({
            matchSummary: zod.array(zod.object({ userId: zod.string(), score: zod.number() })),
            location: zod.string(),
        }),
    },
    ({ body }) => {
        return MatchService.postMatchSummary(body);
    }
);

const getMatchSummary = controllerFactory(
    {
        params: zod.object({ transactionHash: zod.string() }),
    },
    ({ params: { transactionHash } }) => MatchService.getMatchSummary(transactionHash)
);

export default {
    postMatchSummary,
    getMatchSummary,
};
