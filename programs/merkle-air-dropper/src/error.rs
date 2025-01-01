use anchor_lang::prelude::*;

/// Error codes.
#[error_code]
pub enum ErrorCode {
    #[msg("Numerical Overflow")]
    NumericalOverflow,
    #[msg("Cannot Validate Proof.")]
    CannotValidateProof,
    #[msg("Invalid Merkle proof.")]
    InvalidProof,
    #[msg("Invalid Proof Length.")]
    InvalidProofLength,
    #[msg("Drop already claimed.")]
    DropAlreadyClaimed,
    #[msg("Exceeded maximum claim amount.")]
    ExceededMaxClaim,
    #[msg("Exceeded maximum number of claimed nodes.")]
    ExceededMaxNumNodes,
    #[msg("Account is not authorized to execute this instruction")]
    Unauthorized,
    #[msg("Token account owner did not match intended owner")]
    OwnerMismatch,
    #[msg("Bad math")]
    BadMath,
}
