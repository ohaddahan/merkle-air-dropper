import {PublicKey, TransactionInstruction} from '@solana/web3.js'
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync
} from '@solana/spl-token'
import {
    ClaimAirDropInstructionAccounts,
    ClaimAirDropInstructionArgs,
    createClaimAirDropInstruction,
    createCreateMerkleAirDropperSourceInstruction,
    CreateMerkleAirDropperSourceInstructionAccounts,
    CreateMerkleAirDropperSourceInstructionArgs
} from "../merkle-air-dropper-libs";
import {
    getAirDropStatusAccountAddress,
    getMerkleAirDropperSourceAddress,
    getMerkleAirDropperTokenAccount
} from "./pda";

export type CreateCreateMerkleAirDropperTransactionInstructionInput = {
    seed: number;
    merkleRoot: number[];
    maxTotalClaim: number;
    maxNumNodes: number;
    signer: PublicKey;
    mint: PublicKey;
    leavesLen: number;
}

export function createCreateMerkleAirDropperTransactionInstruction(
    {
        seed,
        merkleRoot,
        maxTotalClaim,
        maxNumNodes,
        signer,
        mint,
        leavesLen
    }: CreateCreateMerkleAirDropperTransactionInstructionInput
): TransactionInstruction {

    const args: CreateMerkleAirDropperSourceInstructionArgs = {
        args: {
            seed,
            merkleRoot,
            maxTotalClaim,
            maxNumNodes,
            leavesLen
        }
    }

    const signerTokenAccount = getAssociatedTokenAddressSync(mint, signer)
    const [merkleAirDropperSource] = getMerkleAirDropperSourceAddress({mint, seed});
    const [merkleAirDropperSourceTokenAccount] = getMerkleAirDropperTokenAccount({mint, seed})

    const accounts: CreateMerkleAirDropperSourceInstructionAccounts = {
        signer,
        signerTokenAccount,
        merkleAirDropperSource,
        merkleAirDropperSourceTokenAccount,
        mint,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    }

    return createCreateMerkleAirDropperSourceInstruction(accounts, args)
}

export type CreateClaimAirDropTransactionInstructionInput = {
    seed: number;
    index: number;
    amount: number;
    proof: number[];
    signer: PublicKey;
    mint: PublicKey;
    leavesToProve: number[][];
}

export function createClaimAirDropTransactionInstruction(
    {
        seed,
        index,
        amount,
        proof,
        signer,
        mint,
        leavesToProve
    }: CreateClaimAirDropTransactionInstructionInput
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
    const [merkleAirDropperSource] = getMerkleAirDropperSourceAddress({mint, seed});
    const [merkleAirDropperSourceTokenAccount] = getMerkleAirDropperTokenAccount({mint, seed})
    const [airDropStatus] = getAirDropStatusAccountAddress({mint, claimant, seed})

    const accounts: ClaimAirDropInstructionAccounts = {
        claimant,
        claimantTokenAccount,
        merkleAirDropperSource,
        merkleAirDropperSourceTokenAccount,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        mint,
        airDropStatus
    }

    return createClaimAirDropInstruction(accounts, args)
}