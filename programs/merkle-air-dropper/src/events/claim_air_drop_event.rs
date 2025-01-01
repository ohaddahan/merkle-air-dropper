use anchor_lang::prelude::*;

#[event]
pub struct ClaimedAirDropEvent {
    pub index: u64,
    pub claimant: Pubkey,
    pub mint: Pubkey,
    pub merkle_air_dropper: Pubkey,
    pub amount: u64,
}
