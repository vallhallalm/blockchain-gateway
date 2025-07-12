import zod from "zod";
import { controllerFactory } from "../../../tools/controllerFactory.js";
import DrawService from "../domain/services.js";

const postDraw = controllerFactory(
    {
        body: zod.array(zod.string()),
    },
    ({ body }) => DrawService.postDraw(body)
);

const getDrawParamsToVerify = controllerFactory(
    {
        params: zod.object({ drawId: zod.string() }),
    },
    ({ params: { drawId } }) => DrawService.getDrawParamsToVerify(drawId)
);

export default { postDraw, getDrawParamsToVerify };
