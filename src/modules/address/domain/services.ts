import { ethers, Wallet } from "ethers";
import path from "path";
import fs from "fs-extra";
import AddressMappers from "./mappers.js";
import { Config } from "../../../tools/config.utils.js";
import { AbiCache } from "../../../tools/abi.utils.js";

const postAddress = async (userId: string) => {
    const createdAddress = Wallet.createRandom();

    const folderPath = path.join("./addresses");
    fs.ensureDirSync(folderPath);

    const addressData = {
        address: createdAddress.address,
        privateKey: createdAddress.privateKey,
        mnemonic: createdAddress?.mnemonic?.phrase,
    };

    fs.writeFileSync(path.join(folderPath, `${userId}.json`), JSON.stringify(addressData, null, 2));

    return AddressMappers.mapPostedAddress(addressData);
};

const getAddress = async (address: string) => {
    const provider = new ethers.JsonRpcProvider(Config.values.rpcUrl);
    const balance = await provider.getBalance(address);
    return AddressMappers.mapAddressBalance(
        {
            address,
            balance: ethers.formatEther(balance),
        },
        "MAIN"
    );
};

const getAddressTokenBalance = async (address: string, token: string) => {
    const provider = new ethers.JsonRpcProvider(Config.values.rpcUrl);
    const contract = new ethers.Contract(token, AbiCache.values.erc20, provider);

    const balance = await contract.balanceOf(address);

    return AddressMappers.mapAddressBalance(
        {
            address,
            balance: String(balance),
        },
        token
    );
};

const getAddressNftBalance = async (address: string) => {
    const provider = new ethers.JsonRpcProvider(Config.values.rpcUrl);
    const contractAddresses = ["0x3f836f7Bd7cC30c588720cA68eBbf96031D9409d"].map(ethers.getAddress);

    const holdedNfts: any[] = [];

    for (const contractAddress of contractAddresses) {
        const contract = new ethers.Contract(contractAddress, AbiCache.values.erc1155, provider);

        // Filter TransferSingle events where TARGET_ADDRESS is either sender or receiver
        const filter = contract.filters.TransferSingle(null, null, null);

        const events = await contract.queryFilter(filter, 0, "latest");
        const balances: Record<number, number> = {}; // tokenId => balance

        for (const event of events) {
            const { from, to, id, value } = (event as { args: any }).args;

            if (from === address) {
                balances[id] = Number(balances[id] || 0n) - Number(value);
            }

            if (to === address) {
                balances[id] = Number(balances[id] || 0n) + Number(value);
            }
        }

        let tokenMetadata: Record<string, any> = {};
        for (const [id, balance] of Object.entries(balances)) {
            if (balance > 0) {
                const tokenUri = await contract.uri(id);
                const metadata = await fetch(
                    tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/")
                ).then((res) => res.json());
                tokenMetadata[id] = metadata;
            }
        }
        holdedNfts.push(
            AddressMappers.mapAddressNftBalance({
                balances,
                tokenMetadata,
                contractAddress,
            })
        );
    }
    return {
        nftCollections: holdedNfts.map((nft) => ({
            nfts: nft,
        })),
    };
};

const checkTokenValidity = async (address: string, token: string, tokenId: string) => {
    const provider = new ethers.JsonRpcProvider(Config.values.rpcUrl);
    const contract = new ethers.Contract(token, AbiCache.values.erc1155, provider);
    const balance: bigint = await contract.balanceOf(address, tokenId);

    return AddressMappers.mapAddressNftValidity(balance);
};

const getMintedTokens = async (addressId: string) => {
    const provider = new ethers.JsonRpcProvider(Config.values.rpcUrl);
    const contract = new ethers.Contract(addressId, AbiCache.values.erc1155, provider);

    const filter = contract.filters.TransferSingle(null, ethers.ZeroAddress);

    const logs = await contract.queryFilter(filter, 0, "latest");

    const tokenIds = new Set<string>();

    for (const log of logs) {
        const tokenId = (log as unknown as { args: { id: string } }).args.id.toString();
        tokenIds.add(tokenId);
    }

    let tokenMetadata: Record<string, any> = {};
    for (const id of tokenIds) {
        const tokenUri = await contract.uri(id);
        const metadata = await fetch(tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/")).then(
            (res) => res.json()
        );
        tokenMetadata[id] = metadata;
    }
    return AddressMappers.mapContractIssuedNfts(tokenMetadata);
};

export default {
    postAddress,
    getAddress,
    getAddressTokenBalance,
    getAddressNftBalance,
    checkTokenValidity,
    getMintedTokens,
};
