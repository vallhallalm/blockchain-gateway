import zod from "zod";
import { controllerFactory } from "../../../tools/controllerFactory";
import AddressService from "../domain/services";

const postAddress = controllerFactory(
    {
        body: zod.object({ userId: zod.number() }),
    },
    ({ body: { userId } }) => AddressService.postAddress(userId)
);

export default {
    postAddress,
};
