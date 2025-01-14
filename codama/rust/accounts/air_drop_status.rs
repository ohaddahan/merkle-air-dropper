//! This code was AUTOGENERATED using the codama library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun codama to update it.
//!
//! <https://github.com/codama-idl/codama>
//!

use solana_program::pubkey::Pubkey;
use borsh::BorshSerialize;
use borsh::BorshDeserialize;


#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct AirDropStatus {
pub discriminator: [u8; 8],
pub bump: u8,
pub is_claimed: bool,
#[cfg_attr(feature = "serde", serde(with = "serde_with::As::<serde_with::DisplayFromStr>"))]
pub claimant: Pubkey,
#[cfg_attr(feature = "serde", serde(with = "serde_with::As::<serde_with::DisplayFromStr>"))]
pub mint: Pubkey,
#[cfg_attr(feature = "serde", serde(with = "serde_with::As::<serde_with::DisplayFromStr>"))]
pub merkle_air_dropper: Pubkey,
pub claimed_at: i64,
pub amount: u64,
}


impl AirDropStatus {
      pub const LEN: usize = 122;
  
  
  
  #[inline(always)]
  pub fn from_bytes(data: &[u8]) -> Result<Self, std::io::Error> {
    let mut data = data;
    Self::deserialize(&mut data)
  }
}

impl<'a> TryFrom<&solana_program::account_info::AccountInfo<'a>> for AirDropStatus {
  type Error = std::io::Error;

  fn try_from(account_info: &solana_program::account_info::AccountInfo<'a>) -> Result<Self, Self::Error> {
      let mut data: &[u8] = &(*account_info.data).borrow();
      Self::deserialize(&mut data)
  }
}

  #[cfg(feature = "anchor")]
  impl anchor_lang::AccountDeserialize for AirDropStatus {
      fn try_deserialize_unchecked(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
        Ok(Self::deserialize(buf)?)
      }
  }

  #[cfg(feature = "anchor")]
  impl anchor_lang::AccountSerialize for AirDropStatus {}

  #[cfg(feature = "anchor")]
  impl anchor_lang::Owner for AirDropStatus {
      fn owner() -> Pubkey {
        crate::MERKLE_AIR_DROPPER_ID
      }
  }

  #[cfg(feature = "anchor-idl-build")]
  impl anchor_lang::IdlBuild for AirDropStatus {}

  
  #[cfg(feature = "anchor-idl-build")]
  impl anchor_lang::Discriminator for AirDropStatus {
    const DISCRIMINATOR: [u8; 8] = [0; 8];
  }

