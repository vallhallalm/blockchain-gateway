import fs from "fs/promises";
import path from "path";

export class KeyCache {
    private static _instance: KeyCache;
    static publicToPrivate: Record<string, string> = {};
    static userIdToTheRest: Record<
        string,
        { address: string; privateKey: string; mnemonic: string | undefined }
    > = {};

    private constructor() {
        // Private constructor to enforce singleton
    }

    static async init(directoryPath: string): Promise<void> {
        if (!KeyCache._instance) {
            KeyCache._instance = new KeyCache();
            await KeyCache._instance.load(directoryPath);
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
                    const addressData = JSON.parse(rawData) as {
                        address: string;
                        privateKey: string;
                        mnemonic: string | undefined;
                    };
                    KeyCache.userIdToTheRest[key] = addressData;
                    KeyCache.publicToPrivate[addressData.address] = addressData.privateKey;
                } catch (e) {
                    console.warn(`Skipping invalid JSON file: ${entry.name}`);
                }
            }
        }
    }

    static getInstance(): KeyCache {
        if (!KeyCache._instance) {
            throw new Error("KeyCache has not been initialized. Call KeyCache.init() first.");
        }
        return KeyCache._instance;
    }
}
