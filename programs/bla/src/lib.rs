use anchor_lang::prelude::*;

declare_id!("J5qyvFxq8JprXYyo4n5qGZ8cYuCZUKi6wEzuSmDTPEgB");

#[program]
pub mod bla {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
