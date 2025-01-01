import BN from "bn.js";
import {Connection, PublicKey} from "@solana/web3.js";
import {ClaimAirDropStatus, MerkleAirDropper, PROGRAM_ID} from "../merkle-air-dropper-libs";

export const MerkleAirDropperSeed = "MerkleAirDropper";

export const ClaimAirDropStatusSeed = "ClaimAirDropStatus";

export function getClaimAirDropStatusAccountAddress(merkle_air_dropper: PublicKey, claimant: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(ClaimAirDropStatusSeed)),
            merkle_air_dropper.toBuffer(),
            claimant.toBuffer()
        ],
        PROGRAM_ID
    )
}

export async function getClaimAirDropStatusAccount(connection: Connection, mint: PublicKey, claimant: PublicKey): Promise<ClaimAirDropStatus> {
    const [claim_status] = getClaimAirDropStatusAccountAddress(mint, claimant)
    return await ClaimAirDropStatus.fromAccountAddress(connection, claim_status)
}

export function getMerkleAirDropperAddress(mint: PublicKey, seed: number): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(MerkleAirDropperSeed)),
            mint.toBuffer(),
            new BN(seed).toBuffer("le", 8),
        ],
        PROGRAM_ID
    )
}

export async function getMerkleAirDropperAccount(connection: Connection, mint: PublicKey, seed: number): Promise<MerkleAirDropper> {
    const [merkle_air_dropper] = getMerkleAirDropperAddress(mint, seed);
    return await MerkleAirDropper.fromAccountAddress(connection, merkle_air_dropper)
}

export function getMerkleAirDropperTokenAccount(mint: PublicKey, seed: number): [PublicKey, number] {
    const [merkle_air_dropper] = getMerkleAirDropperAddress(mint, seed);
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(MerkleAirDropperSeed)),
            merkle_air_dropper.toBuffer(),
        ],
        PROGRAM_ID
    )
}
