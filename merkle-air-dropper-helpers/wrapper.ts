import {PublicKey, TransactionInstruction} from '@solana/web3.js'
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync
} from '@solana/spl-token'
import {
    ClaimAirDropInstructionAccounts,
    ClaimAirDropInstructionArgs, createClaimAirDropInstruction,
    createCreateMerkleAirDropperInstruction,
    CreateMerkleAirDropperArgs,
    CreateMerkleAirDropperInstructionAccounts,
    CreateMerkleAirDropperInstructionArgs
} from "../merkle-air-dropper-libs";
import {getClaimAirDropStatusAccountAddress, getDistributorTokenAccount, getMerkleAirDropperAddress} from "./pda";


export function createCreateMerkleAirDropperTransactionInstruction(
    seed: number,
    merkleRoot: number[],
    maxTotalClaim: number,
    maxNumNodes: number,
    signer: PublicKey,
    mint: PublicKey,
    leavesLen: number
): TransactionInstruction {

    const args: CreateMerkleAirDropperInstructionArgs = {
        args: {
            seed,
            merkleRoot,
            maxTotalClaim,
            maxNumNodes,
            leavesLen
        }
    }

    const signerTokenAccount = getAssociatedTokenAddressSync(mint, signer)
    const [merkleAirDropper] = getMerkleAirDropperAddress(mint, seed);
    const [merkleAirDropperTokenAccount] = getDistributorTokenAccount(mint, seed)

    const accounts: CreateMerkleAirDropperInstructionAccounts = {
        signer,
        signerTokenAccount,
        merkleAirDropper,
        merkleAirDropperTokenAccount,
        mint,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    }

    return createCreateMerkleAirDropperInstruction(accounts, args)
}

export function createClaimAirDropTransactionInstruction(
    seed: number,
    index: number,
    amount: number,
    proof: number[],
    signer: PublicKey,
    mint: PublicKey,
    leavesToProve: number[][]
): TransactionInstruction {

    const args: ClaimAirDropInstructionArgs = {
        args: {
            index,
            amount,
            proof: new Uint8Array(proof),
            leavesToProve: leavesToProve.map(i => new Uint8Array(i))
        }
    }

    const claimant = signer
    const claimantTokenAccount = getAssociatedTokenAddressSync(mint, signer)
    const [merkleAirDropper] = getMerkleAirDropperAddress(mint, seed);
    const [merkleAirDropperTokenAccount] = getDistributorTokenAccount(mint, seed)
    const [claimAirDropStatus] = getClaimAirDropStatusAccountAddress(mint, claimant)

    const accounts: ClaimAirDropInstructionAccounts = {
        claimant,
        claimantTokenAccount,
        merkleAirDropper,
        merkleAirDropperTokenAccount,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        mint,
        claimAirDropStatus
    }

    return createClaimAirDropInstruction(accounts, args)
}