use crate::events::merkle_air_dropper_event::MerkleAirDropperEvent;
use crate::state::merkle_air_dropper::MerkleAirDropper;
use crate::utils::transfer_token;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateMerkleAirDropperArgs {
    pub merkle_root: [u8; 32],
    pub seed: u64,
    pub max_total_claim: u64,
    pub max_num_nodes: u64,
    pub leaves_len: u64,
}

#[derive(Accounts)]
#[instruction(args: CreateMerkleAirDropperArgs)]
pub struct CreateMerkleAirDropper<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
    mut,
    associated_token::mint = mint,
    associated_token::authority = signer,
    )]
    pub signer_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
    init,
    seeds = [MerkleAirDropper::SEED.as_bytes(),mint.key().as_ref(), &args.seed.to_le_bytes()],
    space = MerkleAirDropper::LEN,
    payer = signer,
    bump,
    )]
    pub merkle_air_dropper: Account<'info, MerkleAirDropper>,
    #[account(
    init,
    payer = signer,
    token::mint = mint,
    token::authority = merkle_air_dropper,
    seeds = [MerkleAirDropper::SEED.as_bytes(), merkle_air_dropper.key().as_ref()],
    bump
    )]
    pub merkle_air_dropper_token_account: Box<Account<'info, TokenAccount>>,
    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_merkle_air_dropper(
    ctx: Context<CreateMerkleAirDropper>,
    args: CreateMerkleAirDropperArgs,
) -> Result<()> {
    let signer = &ctx.accounts.signer;
    let signer_token_account = &ctx.accounts.signer_token_account;
    let merkle_air_dropper = &mut ctx.accounts.merkle_air_dropper;
    let merkle_air_dropper_token_account = &ctx.accounts.merkle_air_dropper_token_account;
    let token_program = &ctx.accounts.token_program;
    merkle_air_dropper.bump = ctx.bumps.merkle_air_dropper;
    merkle_air_dropper.seed = args.seed;
    merkle_air_dropper.signer = ctx.accounts.signer.key();
    merkle_air_dropper.merkle_root = args.merkle_root;
    merkle_air_dropper.mint = ctx.accounts.mint.key();
    merkle_air_dropper.max_total_claim = args.max_total_claim;
    merkle_air_dropper.max_num_nodes = args.max_num_nodes;
    merkle_air_dropper.total_amount_claimed = 0;
    merkle_air_dropper.num_nodes_claimed = 0;
    merkle_air_dropper.token_account = merkle_air_dropper_token_account.key();
    merkle_air_dropper.leaves_len = args.leaves_len;
    transfer_token(
        signer_token_account.to_account_info(),
        merkle_air_dropper_token_account.to_account_info(),
        token_program.to_account_info(),
        signer.to_account_info(),
        args.max_total_claim,
    )?;
    emit!(MerkleAirDropperEvent {
        seed: merkle_air_dropper.seed,
        signer: merkle_air_dropper.signer.key(),
        merkle_root: merkle_air_dropper.merkle_root,
        mint: merkle_air_dropper.mint.key(),
        token_account: merkle_air_dropper_token_account.key(),
        max_total_claim: merkle_air_dropper.max_total_claim,
        max_num_nodes: merkle_air_dropper.max_num_nodes,
        total_amount_claimed: merkle_air_dropper.total_amount_claimed,
        num_nodes_claimed: merkle_air_dropper.num_nodes_claimed,
        leaves_len: merkle_air_dropper.leaves_len
    });
    Ok(())
}
