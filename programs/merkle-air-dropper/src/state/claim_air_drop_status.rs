use anchor_lang::prelude::*;

/// Holds whether or not a claimant has claimed tokens.
#[account]
#[derive(Default)]
pub struct ClaimAirDropStatus {
    pub bump: u8,
    /// If true, the tokens have been claimed.
    pub is_claimed: bool,
    /// Authority that claimed the tokens.
    pub claimant: Pubkey,
    /// Mint of claimed the tokens.
    pub mint: Pubkey,
    /// The Distributor
    pub distributor: Pubkey,
    /// When the tokens were claimed.
    pub claimed_at: i64,
    /// Amount of tokens claimed.
    pub amount: u64,
}

impl ClaimAirDropStatus {
    pub const LEN: usize = 500;
}
