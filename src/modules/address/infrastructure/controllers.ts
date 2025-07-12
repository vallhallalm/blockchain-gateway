import zod from "zod";
import { controllerFactory } from "../../../tools/controllerFactory.js";
import AddressService from "../domain/services.js";

const postAddress = controllerFactory(
    {
        body: zod.object({ userId: zod.string() }),
    },
    ({ body: { userId } }) => AddressService.postAddress(userId)
);

const getAddressBalance = controllerFactory(
    {
        params: zod.object({ addressId: zod.string() }),
    },
    ({ params: { addressId } }) => AddressService.getAddress(addressId)
);

const getAddressTokenBalance = controllerFactory(
    {
        params: zod.object({ addressId: zod.string(), token: zod.string() }),
    },
    ({ params: { addressId, token } }) => AddressService.getAddressTokenBalance(addressId, token)
);

const getAddressNftBalance = controllerFactory(
    {
        params: zod.object({ addressId: zod.string() }),
    },
    ({ params: { addressId } }) => AddressService.getAddressNftBalance(addressId)
);

const checkTokenValidity = controllerFactory(
    {
        params: zod.object({
            addressId: zod.string(),
            token: zod.string(),
            tokenId: zod.string(),
        }),
    },
    ({ params: { addressId, token, tokenId } }) =>
        AddressService.checkTokenValidity(addressId, token, tokenId)
);

const getMintedTokens = controllerFactory(
    {
        params: zod.object({ addressId: zod.string() }),
    },
    ({ params: { addressId } }) => AddressService.getMintedTokens(addressId)
);

export default {
    postAddress,
    getAddressBalance,
    getAddressTokenBalance,
    getAddressNftBalance,
    checkTokenValidity,
    getMintedTokens,
};
