import {
    BlockheightBasedTransactionConfirmationStrategy,
    Connection,
    Keypair,
    PublicKey,
    SignatureResult,
    Transaction,
    TransactionInstruction
} from '@solana/web3.js'
import assert from 'assert'
import keccak256 from 'keccak256'
import fs from 'fs'

export type Claimant = {
    claimant: string;
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
    // console.log(`wallet public key: ${loaded.publicKey}`)
    return Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString()))
    )
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
    if (!sig?.Signature) {
        return
    }
    const txn = await connection.getParsedTransaction(sig.Signature, 'confirmed')
    assert.equal(
        sig?.SignatureResult.err,
        null,
        `${txn?.meta?.logMessages?.join('\n')}\n\n${JSON.stringify(sig)}`
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
): Promise<TxnResult | undefined> {
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
