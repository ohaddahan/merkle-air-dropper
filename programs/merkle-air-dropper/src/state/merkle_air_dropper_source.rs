use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct MerkleAirDropperSource {
    pub bump: u8,
    pub seed: u64,
    pub signer: Pubkey,
    pub merkle_root: [u8; 32],
    pub mint: Pubkey,
    pub token_account: Pubkey,
    pub max_total_claim: u64,
    pub max_num_nodes: u64,
    pub total_amount_claimed: u64,
    pub num_nodes_claimed: u64,
    pub leaves_len: u64,
}

impl MerkleAirDropperSource {
    pub const LEN: usize = 500;
    pub const SEED: &'static str = "MerkleAirDropperSource";
}
