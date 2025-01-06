import {MerkleOutput} from "./merkle-air-dropper-helpers/helpers.ts";

export async function loadMerkleFromUrl(): Promise<MerkleOutput | undefined> {
    try {
        const response = await fetch(import.meta.env.VITE_MERKLE_JSON);
        if (!response.ok) {
            return undefined
        }
        const data: MerkleOutput = await response.json();
        console.log("data", data)
        return data;
    } catch (error) {
        console.error("Error loading JSON:", error);
    }
    return undefined
}