import {
    Connection,
    Keypair,
    Transaction,
    TransactionInstruction,
    SignatureResult,
    PublicKey,
    BlockheightBasedTransactionConfirmationStrategy,
    ParsedTransactionWithMeta
} from '@solana/web3.js'
import {Program} from '@coral-xyz/anchor'
import {
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
    NATIVE_MINT
} from '@solana/spl-token'
import assert from 'assert'
import keccak256 from 'keccak256'
import fs from 'fs'

export type Claimant = {
    claimant: number[];
    amount: number;
}

export type Leaf = {
    index: number;
    proof: number[];
    claimant: Claimant;
    leaves_to_prove: number[][];
}

export type MerkleOutput = {
    root: number[];
    leafs: Leaf[];
}

export function loadWalletKey(keypair: string): Keypair {
    if (!keypair || keypair == '') {
        throw new Error('Keypair is required!')
    }
    const loaded = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString()))
    )
    // console.log(`wallet public key: ${loaded.publicKey}`)
    return loaded
}

export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function processAndValidateTransaction(
    instructions: TransactionInstruction[],
    connection: Connection,
    signer: Keypair
) {
    const sig = await processTransaction(instructions, connection, signer)
    // console.log('Transaction signature: ', sig.Signature)
    const txn = await connection.getParsedTransaction(sig.Signature, 'confirmed')
    // console.log('Transaction: ', txn)
    assert.equal(
        sig.SignatureResult.err,
        null,
        `${txn?.meta?.logMessages.join('\n')}\n\n${JSON.stringify(sig)}`
    )
}

export declare type TxnResult = {
    Signature: string;
    SignatureResult: SignatureResult;
};

export async function processTransaction(
    instructions: TransactionInstruction[],
    connection: Connection,
    payer: Keypair
): Promise<TxnResult> {
    try {

        const tx = new Transaction()
        instructions.map((i) => tx.add(i))
        const blockStats = await connection.getLatestBlockhash()
        tx.recentBlockhash = blockStats.blockhash
        tx.feePayer = payer.publicKey
        tx.sign(payer)
        const sig = await connection.sendRawTransaction(tx.serialize(), {
            maxRetries: 3,
            preflightCommitment: 'confirmed',
            skipPreflight: true
        })
        // console.log('Transaction signature: ', sig)
        const strategy: BlockheightBasedTransactionConfirmationStrategy = {
            signature: sig,
            blockhash: blockStats.blockhash,
            lastValidBlockHeight: blockStats.lastValidBlockHeight
        }
        const result = await connection.confirmTransaction(strategy, 'confirmed')
        return {
            Signature: sig,
            SignatureResult: result.value
        }
    } catch (e) {
        console.log('processTransaction error', e)
    }
}

export async function airdrop(
    program: Program<any>,
    receiver: PublicKey,
    amount: number
) {
    const sig = await program.provider.connection.requestAirdrop(
        receiver,
        amount
    )
    const blockStats = await program.provider.connection.getLatestBlockhash()
    const strategy: BlockheightBasedTransactionConfirmationStrategy = {
        signature: sig,
        blockhash: blockStats.blockhash,
        lastValidBlockHeight: blockStats.lastValidBlockHeight
    }
    await program.provider.connection.confirmTransaction(strategy, 'confirmed')
}

export async function getTxn(
    program: Program<any>,
    signature: string
): Promise<ParsedTransactionWithMeta> {
    const blockStats = await program.provider.connection.getLatestBlockhash()
    const strategy: BlockheightBasedTransactionConfirmationStrategy = {
        signature: signature,
        blockhash: blockStats.blockhash,
        lastValidBlockHeight: blockStats.lastValidBlockHeight
    }
    await program.provider.connection.confirmTransaction(strategy, 'confirmed')
    return await program.provider.connection.getParsedTransaction(
        signature,
        'confirmed'
    )
}

export async function verboseTxn(transaction: ParsedTransactionWithMeta) {
    console.log(transaction.meta.logMessages.join('\n'))
}

export async function getOrCreateTokenAccountInstruction(
    mint: PublicKey,
    user: PublicKey,
    connection: Connection,
    payer: PublicKey | null = null
): Promise<TransactionInstruction | null> {
    const userTokenAccountAddress = await getAssociatedTokenAddress(
        mint,
        user,
        false
    )
    const userTokenAccount = await connection.getParsedAccountInfo(
        userTokenAccountAddress
    )
    if (userTokenAccount.value === null) {
        return createAssociatedTokenAccountInstruction(
            payer ? payer : user,
            userTokenAccountAddress,
            user,
            mint
        )
    } else {
        return null
    }
}

export function generateString(length = 16) {
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

export async function getWalletBalance(
    connection: Connection,
    wallet: PublicKey,
    mint: PublicKey
): Promise<number> {
    const balance = await connection.getBalance(wallet)
    if (mint.toBase58() === NATIVE_MINT.toBase58()) {
        return balance
    } else {
        const tokenAccount = await getAssociatedTokenAddress(mint, wallet)
        const tokenBalance = await connection.getTokenAccountBalance(
            tokenAccount,
            'confirmed'
        )
        return parseInt(tokenBalance.value.amount)
    }
}

export async function accountExists(
    connection: Connection,
    pubkey: PublicKey
): Promise<boolean> {
    const account_info = await connection.getAccountInfo(pubkey, 'confirmed')
    return account_info !== null
}

export async function getTokenAccountBalance(
    connection: Connection,
    account: PublicKey
): Promise<number> {
    const account_info = await connection.getAccountInfo(account)
    if (account_info === null) {
        return 0
    }
    const tokenBalance = await connection.getTokenAccountBalance(
        account,
        'confirmed'
    )
    return parseInt(tokenBalance.value.amount)
}

export type Hash = {
    hash: number;
    salt: number;
};

export function generateHashInput(game: PublicKey, length: number): Hash {
    const salt = Math.round(1_000_000_000 * Math.random())
    const input = `${game.toBase58()}${length}${salt}`
    const hash = keccak256(input)
    const sum: number = (Array.from(hash) as number[]).reduce(
        (accumulator: number, currentValue: number): number => {
            return accumulator + currentValue
        },
        0
    )
    return {
        hash: sum,
        salt
    }
}

export function walletMap(): Map<string, Keypair> {
    const cwd = process.cwd()
    const map = new Map<string, Keypair>()
    for (let i = 0; i < 12; i++) {
        let key = loadWalletKey(`${cwd}/tests-fixtures/keys/${i}.json`)
        map.set(key.publicKey.toBase58(), key)
    }
    return map
}

export function findDataInMerkle(pubkey: PublicKey, merkle: MerkleOutput): Leaf | null {
    for (const leaf of merkle.leafs) {
        // console.log("type", typeof leaf.claimant.claimant)
        // const uint8Array = new Uint8Array(leaf.claimant.claimant)
        // const pub = new PublicKey(uint8Array)
        const pub = new PublicKey(leaf.claimant.claimant)
        if (pub.toBase58() === pubkey.toBase58()) {
            return leaf
        }
    }
    return null
}
