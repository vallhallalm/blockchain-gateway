import { Wallet } from "ethers";
import path from "path";
import fs from "fs-extra";
import AddressMappers from "./mappers";

const postAddress = async (userId: number) => {
    const createdAddress = Wallet.createRandom();

    const folderPath = path.join("./addresses", String(userId));
    fs.ensureDirSync(folderPath);

    const addressData = {
        address: createdAddress.address,
        privateKey: createdAddress.privateKey,
        mnemonic: createdAddress?.mnemonic?.phrase,
    };

    fs.writeFileSync(path.join(folderPath, "address.json"), JSON.stringify(addressData, null, 2));

    return AddressMappers.mapPostedAddress(addressData);
};

export default {
    postAddress,
};
