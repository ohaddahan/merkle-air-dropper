import * as anchor from '@coral-xyz/anchor'
import {Keypair, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js'
import assert from 'assert'

import {
    createMint,
    getAssociatedTokenAddress,
    mintTo
} from '@solana/spl-token'
import {Program} from '@coral-xyz/anchor'
import {
    airdrop,
    getOrCreateTokenAccountInstruction,
    MerkleOutput,
    processTransaction, walletMap
} from "../merkle-air-dropper-helpers/helpers";
import {MerkleAirDropper} from '../target/types/merkle_air_dropper'


export let merkle_json: MerkleOutput = null

export const admin = Keypair.generate()
export const users = [
    Keypair.generate(),
    Keypair.generate(),
    Keypair.generate()
]
export const tokenMintAuthority = Keypair.generate()
export let mint: PublicKey


describe('0-prep', () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env())

    const program = anchor.workspace.MerkleAirDropper as Program<MerkleAirDropper>

    it('Program ID', async () => {
        console.log(`program.id: ${program.programId.toBase58()}`)
    })

    it('Airdrops', async () => {
        const claimants = Array.from(walletMap().values());

        for (const key of [...users, admin, ...claimants]) {
            await airdrop(program, key.publicKey, LAMPORTS_PER_SOL * 50_000)
        }
    })

    it('Create main mint', async () => {
        mint = await createMint(
            program.provider.connection,
            admin,
            tokenMintAuthority.publicKey,
            tokenMintAuthority.publicKey,
            9
        )
    })

    it('Mint tokens', async () => {
        for (const key of [admin]) {
            const instructions = await getOrCreateTokenAccountInstruction(
                mint,
                key.publicKey,
                program.provider.connection
            )
            if (instructions === null) {
                continue
            }
            const sig = await processTransaction(
                [instructions],
                program.provider.connection,
                key
            )
            const txn = await program.provider.connection.getParsedTransaction(
                sig.Signature,
                'confirmed'
            )
            assert.equal(
                sig.SignatureResult.err,
                null,
                `${mint.toBase58()}\n${txn?.meta?.logMessages.join('\n')}`
            )

            await mintTo(
                program.provider.connection,
                admin,
                mint,
                await getAssociatedTokenAddress(mint, key.publicKey),
                tokenMintAuthority,
                LAMPORTS_PER_SOL * 50_000
            )
        }
    })
})
