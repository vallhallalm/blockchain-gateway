import { ethers } from "ethers";
import { Config } from "../../../tools/config.utils.js";
import { KeyCache } from "../../../tools/keyCache.js";
import { AbiCache } from "../../../tools/abi.utils.js";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import fs from "fs-extra";

const postDraw = async (addresses: string[]) => {
    const provider = new ethers.JsonRpcProvider(Config.values.rpcUrl);
    const wallet = new ethers.Wallet(
        KeyCache.publicToPrivate["0xCB104D769241fA1324D9bf0aC032d98986de9d22"],
        provider
    );

    const contract = new ethers.Contract(
        "0x05C0B18717946A7172358f3dBf18C4302d18A4Da",
        AbiCache.values.merkleDraw,
        wallet
    );

    const drawId = Date.now();
    const leafHashes = addresses.map((addr) => keccak256(addr));
    const tree = new MerkleTree(leafHashes, keccak256, { sortPairs: true });
    const merkleRoot = "0x" + tree.getRoot().toString("hex");

    const currentBlock = await provider.getBlockNumber();
    const drawBlockNumber = currentBlock + 3; // leave some buffer (e.g., 3 blocks)

    fs.writeFileSync(
        `./draws/${drawId}.json`,
        JSON.stringify({
            drawId,
            merkleRoot,
            drawBlockNumber,
            addresses,
        }),
        null
    );

    // Step 1: Create draw
    const tx1 = await contract.createDraw(drawId, merkleRoot, drawBlockNumber);
    await tx1.wait();
    console.log(`✅ Draw ${drawId} created with root: ${merkleRoot} in tx: ${tx1.hash}`);

    // Step 2: Wait until drawBlockNumber is mined
    let latest = await provider.getBlockNumber();
    while (latest < drawBlockNumber + 1) {
        console.log(`⏳ Waiting for draw block... (current=${latest}, target=${drawBlockNumber})`);
        await new Promise((res) => setTimeout(res, 5000));
        latest = await provider.getBlockNumber();
    }

    // Step 3: Generate seed (on-chain)
    const tx2 = await contract.generateSeed(drawId);
    await tx2.wait();
    console.log(`🎲 Seed generated for draw ${drawId} in tx ${tx2.hash}`);

    // Step 4: Get winner from contract
    const winnerIndex = await contract.getWinnerIndex(drawId, addresses.length);
    const winner = addresses[Number(winnerIndex)];
    console.log(`🏆 Winner address: ${winner}`);

    // Step 5: Generate Merkle proof
    const proof = tree.getHexProof(keccak256(winner));
    console.log("🔎 Merkle proof for winner:", proof);

    return { winnerAddress: winner, proof, drawId };
};

const getDrawParamsToVerify = async (drawId: string) => {
    const drawFilePath = `./draws/${drawId}.json`;
    if (!fs.existsSync(drawFilePath)) {
        throw new Error(`Draw with ID ${drawId} not found`);
    }
    const drawData = fs.readJsonSync(drawFilePath);
    return drawData;
};

/*const verifyDrawWinner = async ({
    drawId,
    participantAddresses,
    winnerAddress,
}: {
    drawId: number;
    participantAddresses: string[];
    winnerAddress: string;
}) => {
    // Setup provider & contract
    const provider = new ethers.JsonRpcProvider(Config.values.rpcUrl);
    const contract = new ethers.Contract(
        "0x05C0B18717946A7172358f3dBf18C4302d18A4Da",
        AbiCache.values.merkleDraw,
        provider
    );

    // Generate Merkle Tree
    const leafHashes = participantAddresses.map((addr) => keccak256(addr));
    const tree = new MerkleTree(leafHashes, keccak256, { sortPairs: true });

    // Get winner leaf and proof
    const winnerLeaf = keccak256(winnerAddress);
    const proof = tree.getHexProof(winnerLeaf);
    const leafIndex = leafHashes.findIndex((leaf) => leaf.equals(winnerLeaf));

    if (leafIndex === -1) {
        throw new Error("Winner address not found in participant list");
    }

    // Call contract to verify winner
    const totalParticipants = participantAddresses.length;
    const isValid = await contract.verifyWinner(
        drawId,
        totalParticipants,
        leafIndex,
        winnerAddress,
        proof
    );

    console.log(`✅ Winner verification result: ${isValid}`);
    return isValid;
};*/

export default { postDraw, getDrawParamsToVerify };
