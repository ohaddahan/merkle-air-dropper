//import * as anchor from '@coral-xyz/anchor'
//import * as fs from 'fs'
//import {Keypair, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js'
//import assert from 'assert'
//
//import {
//    createAssociatedTokenAccount,
//    createMint,
//    getAssociatedTokenAddress,
//    mintTo
//} from '@solana/spl-token'
//import {Program} from '@coral-xyz/anchor'
//import {MerkleOutput} from "../merkle-air-dropper-helpers/helpers";
//
//
//export let merkle_json: MerkleOutput = null
//
//export const admin = Keypair.generate()
//export const users = [
//    Keypair.generate(),
//    Keypair.generate(),
//    Keypair.generate()
//]
//export const tokenMintAuthority = Keypair.generate()
//export let mint: PublicKey
//
//export let keys: Keypair[] = []
//
//export const user_for_close = Keypair.generate()
//
//describe('0-prep', () => {
//    // Configure the client to use the local cluster.
//    anchor.setProvider(anchor.AnchorProvider.env())
//
//    const program = anchor.workspace.MerkleDistributor as Program<MerkleDistributor>
//
//    it('Program ID', async () => {
//        console.log(`program.id: ${program.programId.toBase58()}`)
//    })
//
//    it('Airdrops', async () => {
//        for (const key of [...users, admin, user_for_close]) {
//            await airdrop(program, key.publicKey, LAMPORTS_PER_SOL * 50_000)
//        }
//    })
//
//    it('Create main mint', async () => {
//        mint = await createMint(
//            program.provider.connection,
//            admin,
//            tokenMintAuthority.publicKey,
//            tokenMintAuthority.publicKey,
//            9
//        )
//    })
//
//    it('Mint tokens', async () => {
//        for (const key of [admin]) {
//            const instructions = await getOrCreateTokenAccountInstruction(
//                mint,
//                key.publicKey,
//                program.provider.connection
//            )
//            if (instructions === null) {
//                continue
//            }
//            const sig = await processTransaction(
//                [instructions],
//                program.provider.connection,
//                key
//            )
//            const txn = await program.provider.connection.getParsedTransaction(
//                sig.Signature,
//                'confirmed'
//            )
//            assert.equal(
//                sig.SignatureResult.err,
//                null,
//                `${mint.toBase58()}\n${txn?.meta?.logMessages.join('\n')}`
//            )
//
//            await mintTo(
//                program.provider.connection,
//                admin,
//                mint,
//                await getAssociatedTokenAddress(mint, key.publicKey),
//                tokenMintAuthority,
//                LAMPORTS_PER_SOL * 50_000
//            )
//        }
//    })
//
//    it('create distributor', async () => {
//        const cwd = process.cwd()
//        const merkle_file = fs.readFileSync(`${cwd}/programs/merkle-distributor/test-merkle/merkle.json`).toString()
//        merkle_json = JSON.parse(merkle_file)
//        // console.log('merkle_json = ', merkle_json)
//        const instruction = createDistributorTransactionInstruction(merkle_json.root,
//            LAMPORTS_PER_SOL * 1_000, 12,
//            admin.publicKey,
//            mint,
//            merkle_json.leafs.length
//        )
//        const sig = await processTransaction(
//            [instruction],
//            program.provider.connection,
//            admin
//        )
//        const txn = await program.provider.connection.getParsedTransaction(
//            sig.Signature,
//            'confirmed'
//        )
//        assert.equal(
//            sig.SignatureResult.err,
//            null,
//            `${mint.toBase58()}\n${txn?.meta?.logMessages.join('\n')}`
//        )
//
//        const distributor = await getDistributorAccount(program.provider.connection, mint)
//        const [distributorTokenAccountAddress] = getDistributorTokenAccount(mint)
//        const tokenBalance = await program.provider.connection.getTokenAccountBalance(
//            distributorTokenAccountAddress,
//            'confirmed'
//        )
//    })
//
//    it('claim-by-users', async () => {
//        const wallets = walletMap()
//        for (const [_pubkey, key] of wallets.entries()) {
//            await airdrop(program, key.publicKey, LAMPORTS_PER_SOL * 50_000)
//        }
//        for (const [_pubkey, key] of wallets.entries()) {
//            const leaf = findDataInMerkle(key.publicKey, merkle_json)
//            const distributorPre = await getDistributorAccount(program.provider.connection, mint)
//            const pre = distributorPre.pretty().totalAmountClaimed as number
//            const instruction = createClaimStatusTransactionInstruction(
//                leaf.index,
//                leaf.claimant.amount,
//                leaf.proof,
//                key.publicKey,
//                mint,
//                leaf.leaves_to_prove
//            )
//            const sig = await processTransaction(
//                [instruction],
//                program.provider.connection,
//                key
//            )
//            const txn = await program.provider.connection.getParsedTransaction(
//                sig.Signature,
//                'confirmed'
//            )
//            assert.equal(
//                sig.SignatureResult.err,
//                null,
//                `${mint.toBase58()}\n${txn?.meta?.logMessages.join('\n')}`
//            )
//            const distributorPost = await getDistributorAccount(program.provider.connection, mint)
//            const post = distributorPost.pretty().totalAmountClaimed as number
//            const balancePost = await getWalletBalance(program.provider.connection, key.publicKey, mint)
//            assert(balancePost == leaf.claimant.amount)
//            assert(post - pre == balancePost)
//        }
//    })
//})
//