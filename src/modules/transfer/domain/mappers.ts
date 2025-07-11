import { Transaction } from "ethers";

const transferReturnMapper = (tx: Transaction) => {
    return {
        txHash: tx.hash,
    };
};

export default { transferReturnMapper };
