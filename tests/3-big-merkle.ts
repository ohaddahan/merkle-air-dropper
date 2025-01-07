import * as anchor from '@coral-xyz/anchor'
import * as fs from 'fs'
import {ComputeBudgetProgram, Keypair, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js'
import assert from 'assert'

import {
    createAssociatedTokenAccount,
    createMint,
    getAssociatedTokenAddress,
    mintTo
} from '@solana/spl-token'
import {Program} from '@coral-xyz/anchor'
import {
    accountExists, airdrop,
    findDataInMerkle,
    getTokenAccountBalance, getWalletBalance,
    loadWalletKey,
    MerkleOutput, processTransaction,
    walletMap
} from "../merkle-air-dropper-helpers/helpers";
import {MerkleAirDropper} from '../target/types/merkle_air_dropper'
import {admin, mint, users} from "./0-prep";
import {
    createClaimAirDropTransactionInstruction,
    createCreateMerkleAirDropperTransactionInstruction
} from "../merkle-air-dropper-helpers/wrapper";
import {getMerkleAirDropperSourceAccount} from "../merkle-air-dropper-helpers/pda";

export let merkle_json: MerkleOutput = null

describe('3-big-merkle', () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env())

    const program = anchor.workspace.MerkleAirDropper as Program<MerkleAirDropper>


    it('create-air-dropper', async () => {
        const cwd = process.cwd()
        const merkle_file = fs.readFileSync(`${cwd}/tests-fixtures/merkle/32k_merkle.json`).toString()
        merkle_json = JSON.parse(merkle_file)
        const instruction = createCreateMerkleAirDropperTransactionInstruction(
            {
                seed: 2,
                merkleRoot: merkle_json.root,
                maxTotalClaim: LAMPORTS_PER_SOL * 1_000,
                maxNumNodes: merkle_json.leafs.length,
                signer: admin.publicKey,
                mint,
                leavesLen: merkle_json.leafs.length
            }
        )
        const sig = await processTransaction(
            [instruction],
            program.provider.connection,
            admin
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

        const merkleAirDropperSource = await getMerkleAirDropperSourceAccount({
            connection: program.provider.connection,
            mint,
            seed: 2
        })
        assert(merkleAirDropperSource.pretty().maxTotalClaim === LAMPORTS_PER_SOL * 1_000)
    })

    it("claim-by-user", async () => {
        const cwd = process.cwd()
        const merkle_file = fs.readFileSync(`${cwd}/tests-fixtures/merkle/32k_merkle.json`).toString()
        merkle_json = JSON.parse(merkle_file)
        const claimants = walletMap("/tests-fixtures/32k-keys/");
        const claimant = Array.from(claimants.values())[2]
        const claimantData = findDataInMerkle(claimant.publicKey, merkle_json)
        assert(claimantData !== null)
        await airdrop(program, claimant.publicKey, LAMPORTS_PER_SOL)
        const preTokenAccount = await getAssociatedTokenAddress(mint, claimant.publicKey)
        const accountPre = await accountExists(program.provider.connection, preTokenAccount);
        assert(accountPre === false)
        const merkleAirDropperSourcePre = await getMerkleAirDropperSourceAccount({
            connection: program.provider.connection,
            mint,
            seed: 2
        })
        assert(merkleAirDropperSourcePre.pretty().numNodesClaimed === 0)
        assert(merkleAirDropperSourcePre.pretty().totalAmountClaimed === 0)
        const instruction = createClaimAirDropTransactionInstruction(
            {
                seed: merkleAirDropperSourcePre.pretty().seed as number,
                index: claimantData.index,
                amount: claimantData.claimant.amount,
                proof: claimantData.proof,
                signer: claimant.publicKey,
                mint,
                leavesToProve: claimantData.leaves_to_prove
            }
        )
        console.log("instruction", instruction.data.length, "claimantData.proof", claimantData.proof.length)
        const computeBudgetInstruction = ComputeBudgetProgram.setComputeUnitLimit({
            units: 1_400_000, // Set the desired Compute Unit limit
        });
        const sig = await processTransaction(
            [computeBudgetInstruction, instruction],
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
        const merkleAirDropperSourcePost = await getMerkleAirDropperSourceAccount({
            connection: program.provider.connection,
            mint,
            seed: 2
        })
        assert(merkleAirDropperSourcePost.pretty().numNodesClaimed === 1)
        assert(merkleAirDropperSourcePost.pretty().totalAmountClaimed === claimantData.claimant.amount)
        const tokenBalance = await getWalletBalance(program.provider.connection, claimant.publicKey, mint)
        assert(tokenBalance === claimantData.claimant.amount)
    })
})
