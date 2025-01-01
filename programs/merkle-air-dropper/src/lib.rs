#![allow(dead_code)]
#![allow(ambiguous_glob_reexports)]
use anchor_lang::prelude::*;

pub mod error;
pub mod events;
pub mod instructions;
pub mod state;
pub mod utils;

pub use instructions::*;

declare_id!("J5qyvFxq8JprXYyo4n5qGZ8cYuCZUKi6wEzuSmDTPEgB");

#[program]
pub mod merkle_air_dropper {
    use super::*;

    pub fn claim_air_drop(ctx: Context<ClaimAirDrop>, args: ClaimAirDropArgs) -> Result<()> {
        claim_air_drop::claim_air_drop(ctx, args)
    }

    pub fn create_merkle_air_dropper(
        ctx: Context<CreateMerkleAirDropper>,
        args: CreateMerkleAirDropperArgs,
    ) -> Result<()> {
        create_merkle_air_dropper::create_merkle_air_dropper(ctx, args)
    }
}
