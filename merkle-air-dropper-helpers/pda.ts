import BN from "bn.js";
import {Connection, PublicKey} from "@solana/web3.js";
import {AirDropStatus, MerkleAirDropperSource, PROGRAM_ID} from "../merkle-air-dropper-libs";
import * as anchor from '@coral-xyz/anchor'

export const MerkleAirDropperSourceSeed = "MerkleAirDropperSource";

export const AirDropStatusSeed = "AirDropStatus";

export function getClaimAirDropStatusAccountAddress(merkle_air_dropper: PublicKey, claimant: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(AirDropStatusSeed)),
            merkle_air_dropper.toBuffer(),
            claimant.toBuffer()
        ],
        PROGRAM_ID
    )
}

export async function getClaimAirDropStatusAccount(connection: Connection, mint: PublicKey, claimant: PublicKey): Promise<AirDropStatus> {
    const [claim_status] = getClaimAirDropStatusAccountAddress(mint, claimant)
    return await AirDropStatus.fromAccountAddress(connection, claim_status)
}

export function getMerkleAirDropperSourceAddress(mint: PublicKey, seed: number): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(MerkleAirDropperSourceSeed)),
            mint.toBuffer(),
            new BN(seed).toBuffer("le", 8),
        ],
        PROGRAM_ID
    )
}

export async function getMerkleAirDropperSourceAccount(connection: Connection, mint: PublicKey, seed: number): Promise<MerkleAirDropperSource> {
    const [merkle_air_dropper] = getMerkleAirDropperSourceAddress(mint, seed);
    return await MerkleAirDropperSource.fromAccountAddress(connection, merkle_air_dropper)
}

export function getMerkleAirDropperTokenAccount(mint: PublicKey, seed: number): [PublicKey, number] {
    const [merkle_air_dropper] = getMerkleAirDropperSourceAddress(mint, seed);
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(MerkleAirDropperSourceSeed)),
            merkle_air_dropper.toBuffer(),
        ],
        PROGRAM_ID
    )
}
