import * as anchor from '@coral-xyz/anchor'
import * as fs from 'fs'
import {LAMPORTS_PER_SOL} from '@solana/web3.js'
import assert from 'assert'
import {Program} from '@coral-xyz/anchor'
import {MerkleOutput, processTransaction} from "../merkle-air-dropper-helpers/helpers";
import {admin, mint} from "./0-prep";
import {createCreateMerkleAirDropperTransactionInstruction} from "../merkle-air-dropper-helpers/wrapper";
import {
    getMerkleAirDropperAccount,
} from "../merkle-air-dropper-helpers/pda";
import {MerkleAirDropper} from '../target/types/merkle_air_dropper'


export let merkle_json: MerkleOutput = null


describe('1-create-air-dropper', () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env())

    const program = anchor.workspace.MerkleAirDropper as Program<MerkleAirDropper>

    it('create distributor', async () => {
        const cwd = process.cwd()
        const merkle_file = fs.readFileSync(`${cwd}/tests-fixtures/plan/merkle.json`).toString()
        merkle_json = JSON.parse(merkle_file)
        const instruction = createCreateMerkleAirDropperTransactionInstruction(1, merkle_json.root,
            LAMPORTS_PER_SOL * 1_000,
            12,
            admin.publicKey,
            mint,
            merkle_json.leafs.length
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

        const merkleAirDropper = await getMerkleAirDropperAccount(program.provider.connection, mint, 1)
        assert(merkleAirDropper.pretty().maxTotalClaim === LAMPORTS_PER_SOL * 1_000)
    })
})
