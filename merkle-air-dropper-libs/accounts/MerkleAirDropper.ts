/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import * as beetSolana from '@metaplex-foundation/beet-solana'

/**
 * Arguments used to create {@link MerkleAirDropper}
 * @category Accounts
 * @category generated
 */
export type MerkleAirDropperArgs = {
  bump: number
  seed: beet.bignum
  signer: web3.PublicKey
  merkleRoot: number[] /* size: 32 */
  mint: web3.PublicKey
  tokenAccount: web3.PublicKey
  maxTotalClaim: beet.bignum
  maxNumNodes: beet.bignum
  totalAmountClaimed: beet.bignum
  numNodesClaimed: beet.bignum
  leavesLen: beet.bignum
}

export const merkleAirDropperDiscriminator = [
  34, 133, 189, 38, 217, 39, 47, 248,
]
/**
 * Holds the data for the {@link MerkleAirDropper} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class MerkleAirDropper implements MerkleAirDropperArgs {
  private constructor(
    readonly bump: number,
    readonly seed: beet.bignum,
    readonly signer: web3.PublicKey,
    readonly merkleRoot: number[] /* size: 32 */,
    readonly mint: web3.PublicKey,
    readonly tokenAccount: web3.PublicKey,
    readonly maxTotalClaim: beet.bignum,
    readonly maxNumNodes: beet.bignum,
    readonly totalAmountClaimed: beet.bignum,
    readonly numNodesClaimed: beet.bignum,
    readonly leavesLen: beet.bignum
  ) {}

  /**
   * Creates a {@link MerkleAirDropper} instance from the provided args.
   */
  static fromArgs(args: MerkleAirDropperArgs) {
    return new MerkleAirDropper(
      args.bump,
      args.seed,
      args.signer,
      args.merkleRoot,
      args.mint,
      args.tokenAccount,
      args.maxTotalClaim,
      args.maxNumNodes,
      args.totalAmountClaimed,
      args.numNodesClaimed,
      args.leavesLen
    )
  }

  /**
   * Deserializes the {@link MerkleAirDropper} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [MerkleAirDropper, number] {
    return MerkleAirDropper.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link MerkleAirDropper} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<MerkleAirDropper> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find MerkleAirDropper account at ${address}`)
    }
    return MerkleAirDropper.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'J5qyvFxq8JprXYyo4n5qGZ8cYuCZUKi6wEzuSmDTPEgB'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, merkleAirDropperBeet)
  }

  /**
   * Deserializes the {@link MerkleAirDropper} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [MerkleAirDropper, number] {
    return merkleAirDropperBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link MerkleAirDropper} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return merkleAirDropperBeet.serialize({
      accountDiscriminator: merkleAirDropperDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link MerkleAirDropper}
   */
  static get byteSize() {
    return merkleAirDropperBeet.byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link MerkleAirDropper} data from rent
   *
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      MerkleAirDropper.byteSize,
      commitment
    )
  }

  /**
   * Determines if the provided {@link Buffer} has the correct byte size to
   * hold {@link MerkleAirDropper} data.
   */
  static hasCorrectByteSize(buf: Buffer, offset = 0) {
    return buf.byteLength - offset === MerkleAirDropper.byteSize
  }

  /**
   * Returns a readable version of {@link MerkleAirDropper} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      bump: this.bump,
      seed: (() => {
        const x = <{ toNumber: () => number }>this.seed
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      signer: this.signer.toBase58(),
      merkleRoot: this.merkleRoot,
      mint: this.mint.toBase58(),
      tokenAccount: this.tokenAccount.toBase58(),
      maxTotalClaim: (() => {
        const x = <{ toNumber: () => number }>this.maxTotalClaim
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      maxNumNodes: (() => {
        const x = <{ toNumber: () => number }>this.maxNumNodes
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      totalAmountClaimed: (() => {
        const x = <{ toNumber: () => number }>this.totalAmountClaimed
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      numNodesClaimed: (() => {
        const x = <{ toNumber: () => number }>this.numNodesClaimed
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      leavesLen: (() => {
        const x = <{ toNumber: () => number }>this.leavesLen
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const merkleAirDropperBeet = new beet.BeetStruct<
  MerkleAirDropper,
  MerkleAirDropperArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['seed', beet.u64],
    ['signer', beetSolana.publicKey],
    ['merkleRoot', beet.uniformFixedSizeArray(beet.u8, 32)],
    ['mint', beetSolana.publicKey],
    ['tokenAccount', beetSolana.publicKey],
    ['maxTotalClaim', beet.u64],
    ['maxNumNodes', beet.u64],
    ['totalAmountClaimed', beet.u64],
    ['numNodesClaimed', beet.u64],
    ['leavesLen', beet.u64],
  ],
  MerkleAirDropper.fromArgs,
  'MerkleAirDropper'
)