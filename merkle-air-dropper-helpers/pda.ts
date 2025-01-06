import BN from "bn.js";
import {Connection, PublicKey} from "@solana/web3.js";
import {AirDropStatus, MerkleAirDropperSource, PROGRAM_ID} from "../merkle-air-dropper-libs";
import * as anchor from '@coral-xyz/anchor'

export const MerkleAirDropperSourceSeed = "MerkleAirDropperSource";

export const AirDropStatusSeed = "AirDropStatus";

export type GetAirDropStatusAccountAddressInput = {
    seed: number;
    mint: PublicKey;
    claimant: PublicKey;
}

export function getAirDropStatusAccountAddress({
                                                   seed,
                                                   claimant,
                                                   mint
                                               }: GetAirDropStatusAccountAddressInput): [PublicKey, number] {
    const [merkleAirDropper] = getMerkleAirDropperSourceAddress({seed, mint});
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(AirDropStatusSeed)),
            merkleAirDropper.toBuffer(),
            claimant.toBuffer()
        ],
        PROGRAM_ID
    )
}

export type GetAirDropStatusAccountInput = {
    connection: Connection;
    mint: PublicKey;
    claimant: PublicKey;
    seed: number;
}

export async function getAirDropStatusAccount({
                                                  connection,
                                                  mint,
                                                  claimant,
                                                  seed
                                              }: GetAirDropStatusAccountInput): Promise<AirDropStatus> {
    const [airdropStatus] = getAirDropStatusAccountAddress({mint, claimant, seed})
    return await AirDropStatus.fromAccountAddress(connection, airdropStatus)
}

export type GetMerkleAirDropperSourceAddressInput = {
    mint: PublicKey;
    seed: number
}


export function getMerkleAirDropperSourceAddress({
                                                     mint,
                                                     seed
                                                 }: GetMerkleAirDropperSourceAddressInput): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(MerkleAirDropperSourceSeed)),
            mint.toBuffer(),
            new BN(seed).toBuffer("le", 8),
        ],
        PROGRAM_ID
    )
}

export type GetMerkleAirDropperSourceAccountInput = {
    connection: Connection;
    mint: PublicKey;
    seed: number
}

export async function getMerkleAirDropperSourceAccount({
                                                           connection,
                                                           mint,
                                                           seed
                                                       }: GetMerkleAirDropperSourceAccountInput): Promise<MerkleAirDropperSource> {
    const [merkleAirDropper] = getMerkleAirDropperSourceAddress({mint, seed});
    return await MerkleAirDropperSource.fromAccountAddress(connection, merkleAirDropper)
}

export type GetMerkleAirDropperTokenAccountInput = {
    mint: PublicKey;
    seed: number
}

export function getMerkleAirDropperTokenAccount({
                                                    mint,
                                                    seed
                                                }: GetMerkleAirDropperTokenAccountInput): [PublicKey, number] {
    const [merkleAirDropper] = getMerkleAirDropperSourceAddress({mint, seed});
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode(MerkleAirDropperSourceSeed)),
            merkleAirDropper.toBuffer(),
        ],
        PROGRAM_ID
    )
}
