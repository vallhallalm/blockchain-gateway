import { ethers, Transaction } from "ethers";
import { KeyCache } from "../../../tools/keyCache.js";
import { AbiCache } from "../../../tools/abi.utils.js";
import transferMappers from "./mappers.js";

const transferErc20 = async (from: string, to: string, amount: number, token: string) => {
    const provider = new ethers.JsonRpcProvider("https://spicy-rpc.chiliz.com");
    const fromPrivateKey = KeyCache.publicToPrivate[from];
    if (!fromPrivateKey) {
        throw new Error("Private key not found for the given from address");
    }
    const wallet = new ethers.Wallet(fromPrivateKey, provider);
    const contract = new ethers.Contract(token, AbiCache.values.erc20, wallet);
    const weiAmount = amount;
    const tx = await contract.transfer(to, weiAmount);

    console.debug("Waiting for tx confirmation...");
    await tx.wait();

    console.debug(`Transfer successful! Tx hash: ${tx.hash}`);
    return transferMappers.transferReturnMapper(tx);
};

const transferMain = async (from: string, to: string, amount: number) => {
    const provider = new ethers.JsonRpcProvider("https://spicy-rpc.chiliz.com");
    const fromPrivateKey = KeyCache.publicToPrivate[from];
    if (!fromPrivateKey) {
        throw new Error("Private key not found for the given from address");
    }
    const wallet = new ethers.Wallet(fromPrivateKey, provider);

    const weiAmount = ethers.parseEther(String(amount)); // same as parseUnits(amountStr, 18)

    const tx = await wallet.sendTransaction({
        to,
        value: weiAmount,
    });

    console.debug("Waiting for confirmation...");
    await tx.wait();

    console.debug(`Transfer complete. Tx hash: ${tx.hash}`);
    return transferMappers.transferReturnMapper(tx as unknown as Transaction);
};

const transferNft = async (
    from: string,
    to: string,
    amount: number,
    token: string,
    tokenId: number
) => {
    const provider = new ethers.JsonRpcProvider("https://spicy-rpc.chiliz.com");
    const fromPrivateKey = KeyCache.publicToPrivate[from];
    if (!fromPrivateKey) {
        throw new Error("Private key not found for the given from address");
    }
    const wallet = new ethers.Wallet(fromPrivateKey, provider);
    const contract = new ethers.Contract(token, AbiCache.values.erc1155, wallet);
    const tx = await contract.safeTransferFrom(wallet.address, to, tokenId, amount, "0x");

    console.debug("Waiting for tx confirmation...");
    await tx.wait();

    console.debug(`Transfer successful! Tx hash: ${tx.hash}`);
    return transferMappers.transferReturnMapper(tx);
};

export default {
    transferErc20,
    transferMain,
    transferNft,
};
