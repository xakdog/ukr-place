use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use canvas_tile;
use canvas_tile::helpers::count_painted_pixels;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

macro_rules! eligible_charities {
    () => {
        [
            // Website: https://donate.thedigital.gov.ua/
            "66pJhhESDjdeBBDdkKmxYYd7q6GUggYPWjxpMKNX39KV",
        ]
    };
}

const CANVAS_SIZE: usize = 16;
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

    pub fn create_tile(ctx: Context<CreateTile>, position: Point2d) -> Result<()> {
        let user = ctx.accounts.user.to_account_info();
        let canvas = ctx.accounts.tile.to_account_info();
        let cpi_program = ctx.accounts.tile_program.to_account_info();
        let owner_program = ctx.accounts.owner_program.to_account_info();
        let system_program = ctx.accounts.system_program.to_account_info();

        let cpi_accounts = canvas_tile::cpi::accounts::Initialize {
            canvas,
            user,
            owner_program,
            system_program,
        };

        let pos = canvas_tile::Point2d {
            x: position.x,
            y: position.y,
        };

        let (seed, bump) = position.generate_signature_seeds(ctx.program_id);
        let authority_seeds = [seed.as_bytes(), &[bump]];
        let signer_seeds = [&authority_seeds[..]];

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts).with_signer(&signer_seeds);

        canvas_tile::cpi::initialize(cpi_ctx, pos)?;

        Ok(())
    }

    pub fn paint_pixels(
        ctx: Context<PaintPixels>,
        position: Point2d,
        pixels: [[u8; CANVAS_SIZE]; CANVAS_SIZE],
    ) -> Result<()> {
        let pixels_count = count_painted_pixels(pixels);
        let pixel_wallet = &mut ctx.accounts.pixel_wallet;

        if pixel_wallet.available_pixels < pixels_count {
            return Err(error!(ErrorCode::NotEnoughPixels));
        }

        pixel_wallet.available_pixels -= pixels_count;

        let cpi_program = ctx.accounts.tile_program.to_account_info();
        let cpi_accounts = canvas_tile::cpi::accounts::CanvasData {
            canvas: ctx.accounts.tile.to_account_info(),
        };

        let (seed, bump) = position.generate_signature_seeds(ctx.program_id);
        let authority_seeds = [seed.as_bytes(), &[bump]];
        let signer_seeds = [&authority_seeds[..]];

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts).with_signer(&signer_seeds);
        canvas_tile::cpi::draw_over(cpi_ctx, pixels)?;

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

#[derive(Accounts)]
#[instruction(position: Point2d)]
pub struct CreateTile<'info> {
    /// CHECK: should be safe. PDA key will be checked by CanvasTile.
    #[account(
        mut,
        seeds = [position.seed().as_bytes()],
        bump
    )]
    pub tile: UncheckedAccount<'info>,
    pub tile_program: Program<'info, canvas_tile::program::CanvasTile>,
    pub owner_program: Program<'info, crate::program::UkrPlace>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(position: Point2d)]
pub struct PaintPixels<'info> {
    #[account(
        mut,
        seeds = [position.seed().as_bytes()],
        bump
    )]
    pub tile: Account<'info, canvas_tile::CanvasTile>,
    pub tile_program: Program<'info, canvas_tile::program::CanvasTile>,
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

#[derive(AnchorSerialize, AnchorDeserialize, Copy, Clone, Default, Debug)]
pub struct Point2d {
    pub x: i32,
    pub y: i32,
}

impl Point2d {
    pub fn seed(&self) -> String {
        format!("canvas-tile-{}:{}", self.x, self.y)
    }

    pub fn generate_signature_seeds(&self, program_id: &Pubkey) -> (String, u8) {
        let seed = self.seed();
        let seed_bytes = seed.as_bytes();

        let (_authority, authority_bump) = Pubkey::find_program_address(&[seed_bytes], program_id);

        (seed, authority_bump)
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Buy some pixels before drawing")]
    NotEnoughPixels,
    #[msg("Provided pixel tile address is incorrect")]
    InvalidTileAccount,
    #[msg("Only white listed charity accounts are allowed")]
    UnknownCharityAccount,
}
