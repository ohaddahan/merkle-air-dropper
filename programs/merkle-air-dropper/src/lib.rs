#![allow(dead_code)]
#![allow(ambiguous_glob_reexports)]
use anchor_lang::prelude::*;

pub mod error;
pub mod events;
pub mod instructions;
pub mod state;
pub mod utils;

pub use instructions::*;

declare_id!("6yGnfw6ahHDQXequrUaQNv6UxbdmceQYGvZUtFDFrHqR");

#[program]
pub mod merkle_air_dropper {
    use super::*;

    pub fn claim_air_drop(ctx: Context<ClaimAirDrop>, args: ClaimAirDropArgs) -> Result<()> {
        claim_air_drop_status::claim_air_drop(ctx, args)
    }

    pub fn create_merkle_air_dropper_source(
        ctx: Context<CreateMerkleAirDropperSource>,
        args: CreateMerkleAirDropperSourceArgs,
    ) -> Result<()> {
        create_merkle_air_dropper_source::create_merkle_air_dropper_source(ctx, args)
    }
}
