import fs from "fs/promises";
import path from "path";
type abiContractName = "erc20" | "erc1155" | "matchSummary" | "merkleDraw" | string;

export class AbiCache {
    private static _instance: AbiCache;
    static values: Record<abiContractName, any> = {};

    private constructor() {
        // Private constructor to enforce singleton
    }

    static async init(directoryPath: string): Promise<void> {
        if (!AbiCache._instance) {
            AbiCache._instance = new AbiCache();
            await AbiCache._instance.load(directoryPath);
        }
    }

    private async load(directoryPath: string): Promise<void> {
        const entries = await fs.readdir(directoryPath, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isFile() && entry.name.endsWith(".json")) {
                const fullPath = path.join(directoryPath, entry.name);
                const rawData = await fs.readFile(fullPath, "utf-8");
                const key = path.basename(entry.name, ".json");
                try {
                    AbiCache.values[key] = JSON.parse(rawData);
                } catch (e) {
                    console.warn(`Skipping invalid JSON file: ${entry.name}`);
                }
            }
        }
    }

    static getInstance(): AbiCache {
        if (!AbiCache._instance) {
            throw new Error("AbiCache has not been initialized. Call AbiCache.init() first.");
        }
        return AbiCache._instance;
    }
}
