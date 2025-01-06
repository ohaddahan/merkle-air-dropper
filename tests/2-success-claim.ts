import * as anchor from '@coral-xyz/anchor'
import * as fs from 'fs'
import {Keypair, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js'
import assert from 'assert'

import {
    createAssociatedTokenAccount,
    createMint,
    getAssociatedTokenAddress,
    mintTo
} from '@solana/spl-token'
import {Program} from '@coral-xyz/anchor'
import {
    accountExists,
    findDataInMerkle,
    getTokenAccountBalance, getWalletBalance,
    loadWalletKey,
    MerkleOutput, processTransaction,
    walletMap
} from "../merkle-air-dropper-helpers/helpers";
import {MerkleAirDropper} from '../target/types/merkle_air_dropper'
import {admin, mint, users} from "./0-prep";
import {createClaimAirDropTransactionInstruction} from "../merkle-air-dropper-helpers/wrapper";
import {getMerkleAirDropperSourceAccount} from "../merkle-air-dropper-helpers/pda";

export let merkle_json: MerkleOutput = null

describe('1-success-claim', () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env())

    const program = anchor.workspace.MerkleAirDropper as Program<MerkleAirDropper>

    it("claim-by-user", async () => {
        const cwd = process.cwd()
        const merkle_file = fs.readFileSync(`${cwd}/tests-fixtures/plan/merkle.json`).toString()
        merkle_json = JSON.parse(merkle_file)
        const claimants = walletMap();
        const claimant = Array.from(claimants.values())[2]
        const claimantData = findDataInMerkle(claimant.publicKey, merkle_json)
        assert(claimantData !== null)
        const preTokenAccount = await getAssociatedTokenAddress(mint, claimant.publicKey)
        const accountPre = await accountExists(program.provider.connection, preTokenAccount);
        assert(accountPre === false)
        const merkleAirDropperSourcePre = await getMerkleAirDropperSourceAccount(program.provider.connection, mint, 1)
        assert(merkleAirDropperSourcePre.pretty().numNodesClaimed === 0)
        assert(merkleAirDropperSourcePre.pretty().totalAmountClaimed === 0)
        const instruction = createClaimAirDropTransactionInstruction(
            merkleAirDropperSourcePre.pretty().seed as number,
            claimantData.index,
            claimantData.claimant.amount,
            claimantData.proof,
            claimant.publicKey,
            mint,
            claimantData.leaves_to_prove
        )
        const sig = await processTransaction(
            [instruction],
            program.provider.connection,
            claimant
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
        const merkleAirDropperSourcePost = await getMerkleAirDropperSourceAccount(program.provider.connection, mint, 1)
        assert(merkleAirDropperSourcePost.pretty().numNodesClaimed === 1)
        assert(merkleAirDropperSourcePost.pretty().totalAmountClaimed === claimantData.claimant.amount)
        const tokenBalance = await getWalletBalance(program.provider.connection, claimant.publicKey, mint)
        assert(tokenBalance === claimantData.claimant.amount)
    })
})
