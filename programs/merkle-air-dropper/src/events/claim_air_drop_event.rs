use anchor_lang::prelude::*;

/// Emitted when tokens are claimed.
#[event]
pub struct ClaimedAirDropEvent {
    /// Index of the claim.
    pub index: u64,
    /// User that claimed.
    pub claimant: Pubkey,
    /// Mint of claimed the tokens.
    pub mint: Pubkey,
    /// The Distributor
    pub distributor: Pubkey,
    /// Amount of tokens to distribute.
    pub amount: u64,
}
