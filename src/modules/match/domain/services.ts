import { ethers } from "ethers";
import { Config } from "../../../tools/config.utils.js";
import { KeyCache } from "../../../tools/keyCache.js";
import { AbiCache } from "../../../tools/abi.utils.js";
import MatchMappers from "./mappers.js";

const postMatchSummary = async (data: {
    matchSummary: { userId: string; score: number }[];
    location: string;
}) => {
    const provider = new ethers.JsonRpcProvider(Config.values.rpcUrl);
    const wallet = new ethers.Wallet(
        KeyCache.publicToPrivate["0xCB104D769241fA1324D9bf0aC032d98986de9d22"],
        provider
    );

    const MATCH_SUMMARY_CONTRACT_ADDRESS = "0xe64d11C6fDB0781a724EaCce4FdBF15b636EfB4D";

    const contract = new ethers.Contract(
        MATCH_SUMMARY_CONTRACT_ADDRESS,
        AbiCache.values.matchSummary,
        wallet
    );

    const date = Math.floor(Date.now() / 1000);
    const tx = await contract.commitSummary(date, data.location, JSON.stringify(data.matchSummary));
    console.debug("Waiting for tx confirmation...");
    await tx.wait();
    console.debug(`Transfer successful! Tx hash: ${tx.hash}`);
    return MatchMappers.transferReturnMapper(tx);
};

const getMatchSummary = async (transactionHash: string) => {
    const provider = new ethers.JsonRpcProvider(Config.values.rpcUrl);
    const receipt = await provider.getTransactionReceipt(transactionHash);
    if (!receipt) {
        throw new Error("Transaction receipt not found");
    }
    const iface = new ethers.Interface(AbiCache.values.matchSummary);

    const matchCommitedLogs = iface.parseLog(receipt.logs[0]);
    if (!matchCommitedLogs) {
        throw new Error("Match committed logs not found");
    }
    return MatchMappers.matchSummaryLogsMapper(matchCommitedLogs.args);
};
export default {
    postMatchSummary,
    getMatchSummary,
};
