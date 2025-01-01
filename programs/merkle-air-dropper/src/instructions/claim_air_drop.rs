use crate::error::ErrorCode;
use crate::events::claim_air_drop_event::ClaimedAirDropEvent;
use crate::state::claim_air_drop_status::ClaimAirDropStatus;
use crate::state::merkle_air_dropper::MerkleAirDropper;
use crate::utils::{transfer_token_pda, vec_to_array};
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};
use common::helpers::Claimant;
use rs_merkle::algorithms::Sha256;
use rs_merkle::{Hasher, MerkleProof};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ClaimAirDropArgs {
    index: u64,
    amount: u64,
    proof: Vec<u8>,
    leaves_to_prove: Vec<Vec<u8>>,
}

#[derive(Accounts)]
#[instruction(args: ClaimAirDropArgs)]
pub struct ClaimAirDrop<'info> {
    /// Who is claiming the tokens.
    #[account(mut)]
    pub claimant: Signer<'info>,
    #[account(
    init_if_needed,
    associated_token::mint = mint,
    associated_token::authority = claimant,
    payer = claimant
    )]
    pub claimant_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut,
    seeds = [MerkleAirDropper::SEED.as_bytes(), mint.key().as_ref()],
    bump=merkle_air_dropper.bump
    )]
    pub merkle_air_dropper: Account<'info, MerkleAirDropper>,
    #[account(
    mut,
    token::mint = mint,
    token::authority = merkle_air_dropper,
    seeds = [MerkleAirDropper::SEED.as_bytes(), merkle_air_dropper.key().as_ref()],
    bump
    )]
    pub merkle_air_dropper_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
    init,
    seeds = [
    ClaimAirDropStatus::SEED.as_bytes(),
    merkle_air_dropper.key().as_ref(),
    claimant.key().as_ref(),
    ],
    space = ClaimAirDropStatus::LEN,
    payer = claimant,
    bump,
    )]
    pub claim_air_drop_status: Account<'info, ClaimAirDropStatus>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub mint: Box<Account<'info, Mint>>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn claim_air_drop(ctx: Context<ClaimAirDrop>, args: ClaimAirDropArgs) -> Result<()> {
    let clock = Clock::get()?;
    let mint = &ctx.accounts.mint;
    let claim_air_drop_status = &mut ctx.accounts.claim_air_drop_status;
    let claimant = &ctx.accounts.claimant;
    let claimant_token_account = &ctx.accounts.claimant_token_account;
    let merkle_air_dropper_token_account = &ctx.accounts.merkle_air_dropper_token_account;
    let token_program = &ctx.accounts.token_program;
    let merkle_air_dropper = &mut ctx.accounts.merkle_air_dropper;
    require!(
        !claim_air_drop_status.is_claimed && claim_air_drop_status.claimed_at == 0,
        ErrorCode::DropAlreadyClaimed
    );
    require!(claimant.is_signer, ErrorCode::Unauthorized);
    let merkle_root = merkle_air_dropper.merkle_root;
    let proof_bytes = args.proof;
    let proof = MerkleProof::<Sha256>::try_from(proof_bytes.clone())
        .map_err(|_| ErrorCode::InvalidProof)?;
    let indices_to_prove = [args.index as usize];
    let leaves_to_prove = args.leaves_to_prove;
    let leaves_to_prove = leaves_to_prove
        .iter()
        .map(|i| vec_to_array(i))
        .collect::<Vec<[u8; 32]>>();
    let leaves_to_prove = leaves_to_prove.as_slice();

    require!(
        proof.verify(
            merkle_root,
            &indices_to_prove,
            leaves_to_prove,
            merkle_air_dropper.leaves_len as usize,
        ),
        ErrorCode::InvalidProof
    );

    require_eq!(1, leaves_to_prove.len(), ErrorCode::InvalidProofLength);

    let leaf = Claimant {
        claimant: claimant.key(),
        amount: args.amount,
    };

    let leaf = Sha256::hash(&leaf.as_bytes());
    let inner_leaf = leaves_to_prove[0];
    require!(leaf == inner_leaf, ErrorCode::CannotValidateProof);

    claim_air_drop_status.bump = ctx.bumps.claim_air_drop_status;
    claim_air_drop_status.amount = args.amount;
    claim_air_drop_status.is_claimed = true;
    claim_air_drop_status.mint = mint.key();
    claim_air_drop_status.claimed_at = clock.unix_timestamp;
    claim_air_drop_status.claimant = claimant.key();
    claim_air_drop_status.merkle_air_dropper = merkle_air_dropper.key();

    let mint_key = mint.key();
    let seeds = &[
        MerkleAirDropper::SEED.as_ref(),
        mint_key.as_ref(),
        &[merkle_air_dropper.bump],
    ];
    transfer_token_pda(
        merkle_air_dropper_token_account.to_account_info(),
        claimant_token_account.to_account_info(),
        token_program.to_account_info(),
        merkle_air_dropper.to_account_info(),
        args.amount,
        &[seeds],
    )?;
    merkle_air_dropper.total_amount_claimed = merkle_air_dropper
        .total_amount_claimed
        .checked_add(args.amount)
        .ok_or(ErrorCode::BadMath)?;
    require!(
        merkle_air_dropper.total_amount_claimed <= merkle_air_dropper.max_total_claim,
        ErrorCode::ExceededMaxClaim
    );
    merkle_air_dropper.num_nodes_claimed = merkle_air_dropper
        .num_nodes_claimed
        .checked_add(1)
        .ok_or(ErrorCode::BadMath)?;
    require!(
        merkle_air_dropper.num_nodes_claimed <= merkle_air_dropper.max_num_nodes,
        ErrorCode::ExceededMaxNumNodes
    );
    emit!(ClaimedAirDropEvent {
        index: args.index,
        claimant: claimant.key(),
        mint: mint.key(),
        merkle_air_dropper: merkle_air_dropper.key(),
        amount: args.amount
    });
    Ok(())
}
