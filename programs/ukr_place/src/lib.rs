use anchor_lang::prelude::*;
use anchor_lang::solana_program;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

macro_rules! eligible_charities {
    () => {
        [
            // Website: https://donate.thedigital.gov.ua/
            "66pJhhESDjdeBBDdkKmxYYd7q6GUggYPWjxpMKNX39KV",
        ]
    };
}

const PRICE_PER_PIXEL: u64 = 25_000_000; // lamports

#[program]
pub mod ukr_place {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn buy_pixels(ctx: Context<BuyPixels>, amount: u32) -> Result<()> {
        let pixel_wallet = &mut ctx.accounts.pixel_wallet;

        if !charity::is_eligible(ctx.accounts.charity.key) {
            return Err(error!(ErrorCode::UnknownCharityAccount));
        }

        charity::transfer(
            &ctx.accounts.user,
            &ctx.accounts.charity,
            u64::from(amount) * PRICE_PER_PIXEL,
        )?;

        pixel_wallet.available_pixels += u64::from(amount);

        Ok(())
    }
}

mod charity {
    use super::*;
    use std::collections::HashSet;

    pub fn is_eligible(key: &Pubkey) -> bool {
        let key_str = key.to_string();
        let eligible = HashSet::from(eligible_charities!());

        eligible.contains(key_str.as_str())
    }

    pub fn transfer<'info>(
        patron_account: &Signer<'info>,
        fund_account: &SystemAccount<'info>,
        lamports: u64,
    ) -> Result<()> {
        if !self::is_eligible(fund_account.key) {
            panic!("Only white listed charity accounts are eligible");
        }

        let ix = solana_program::system_instruction::transfer(
            &patron_account.key,
            &fund_account.key,
            lamports,
        );

        solana_program::program::invoke(
            &ix,
            &[
                patron_account.to_account_info(),
                fund_account.to_account_info(),
            ],
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub pixel_wallet: Account<'info, PixelWallet>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyPixels<'info> {
    #[account(mut)]
    pub charity: SystemAccount<'info>,
    #[account(mut)]
    pub pixel_wallet: Account<'info, PixelWallet>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct PixelWallet {
    pub available_pixels: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Only white listed charity accounts are allowed")]
    UnknownCharityAccount,
}

// #[derive(AnchorSerialize, AnchorDeserialize, Copy, Clone, Default, Debug)]
// pub struct Point2d {
//     pub x: u32,
//     pub y: u32,
// }
