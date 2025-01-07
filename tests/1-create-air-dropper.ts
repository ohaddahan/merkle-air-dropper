import * as anchor from '@coral-xyz/anchor'
import * as fs from 'fs'
import {LAMPORTS_PER_SOL} from '@solana/web3.js'
import assert from 'assert'
import {Program} from '@coral-xyz/anchor'
import {MerkleOutput, processTransaction} from "../merkle-air-dropper-helpers/helpers";
import {admin, mint} from "./0-prep";
import {createCreateMerkleAirDropperTransactionInstruction} from "../merkle-air-dropper-helpers/wrapper";
import {
    getMerkleAirDropperSourceAccount,
} from "../merkle-air-dropper-helpers/pda";
import {MerkleAirDropper} from '../target/types/merkle_air_dropper'

export let merkle_json: MerkleOutput = null


describe('1-create-air-dropper', () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env())

    const program = anchor.workspace.MerkleAirDropper as Program<MerkleAirDropper>

    it('create-air-dropper', async () => {
        const cwd = process.cwd()
        const merkle_file = fs.readFileSync(`${cwd}/tests-fixtures/plan/merkle.json`).toString()
        merkle_json = JSON.parse(merkle_file)
        const instruction = createCreateMerkleAirDropperTransactionInstruction(
            {
                seed: 1,
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
            seed: 1
        })
        assert(merkleAirDropperSource.pretty().maxTotalClaim === LAMPORTS_PER_SOL * 1_000)
    })
})
