import { ethers, Transaction } from "ethers";

const transferReturnMapper = (tx: Transaction) => {
    return {
        txHash: tx.hash,
    };
};

const matchSummaryLogsMapper = (matchSummaryLogs: ethers.Result) => {
    return {
        date: Number(matchSummaryLogs[0]),
        location: matchSummaryLogs[1],
        matchSummary: JSON.parse(matchSummaryLogs[2]),
    };
};

export default { transferReturnMapper, matchSummaryLogsMapper };
