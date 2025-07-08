import fs from "fs/promises";
import path from "path";

export class Config<T = any> {
    private static _instance: Config;
    static values: any;

    private constructor() {
        // constructeur privé pour éviter les new externes
    }

    static async init(confPath: string): Promise<void> {
        if (!Config._instance) {
            Config._instance = new Config();
            await Config._instance.load(confPath);
        }
    }

    private async load(confPath: string): Promise<void> {
        const rawData = await fs.readFile(confPath, "utf-8");
        Config.values = JSON.parse(rawData);
    }

    // Optionnel : accès direct à l'instance
    static getInstance(): Config {
        if (!Config._instance) {
            throw new Error("Config has not been initialized. Call Config.init() first.");
        }
        return Config._instance;
    }
}
