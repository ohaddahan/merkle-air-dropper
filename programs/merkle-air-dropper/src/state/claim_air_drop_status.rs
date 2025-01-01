use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct ClaimAirDropStatus {
    pub bump: u8,
    pub is_claimed: bool,
    pub claimant: Pubkey,
    pub mint: Pubkey,
    pub merkle_air_dropper: Pubkey,
    pub claimed_at: i64,
    pub amount: u64,
}

impl ClaimAirDropStatus {
    pub const LEN: usize = 500;
    pub const SEED: &'static str = "ClaimAirDropStatus";
}
