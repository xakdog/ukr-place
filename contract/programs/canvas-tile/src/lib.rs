use anchor_lang::prelude::*;
use std::mem::size_of;

declare_id!("EJhGaMkY2tkdpZ6FqzZ5TF1CsUmtAXqt7PP2rp5wQ819");

const CANVAS_SIZE: usize = 16;
const TRANSPARENT_COLOR: u8 = 0;
pub const ACCOUNT_BYTES: usize = size_of::<CanvasTile>();

#[program]
pub mod canvas_tile {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, position: Point2d) -> Result<()> {
        let owner = &ctx.accounts.owner_program;
        let canvas_addr = ctx.accounts.canvas.key();
        let (pda, _bump, _seed) = position.program_address(owner.key);

        // TODO: validate that coordinates are correct
        if !pda.eq(&canvas_addr) {
            return Err(error!(ErrorCode::InvalidTileAddress));
        }

        ctx.accounts.canvas.position = position;
        ctx.accounts.canvas.owner = ctx.accounts.owner_program.key();

        Ok(())
    }

    pub fn draw_over(
        ctx: Context<CanvasData>,
        pixels: [[u8; CANVAS_SIZE]; CANVAS_SIZE],
    ) -> Result<()> {
        let now = Clock::get()?;
        let canvas = &mut ctx.accounts.canvas;

        canvas.times_modified += 1;
        canvas.last_modified = now.unix_timestamp;

        save_painted_pixels(pixels, &mut canvas.pixels);

        Ok(())
    }
}

pub mod helpers {
    use super::*;

    pub fn count_painted_pixels(pixels: [[u8; CANVAS_SIZE]; CANVAS_SIZE]) -> u64 {
        pixels
            .iter()
            .flat_map(|row| row.iter())
            .map(|pix| if *pix == TRANSPARENT_COLOR { 0 } else { 1 })
            .fold(0, |total, cnt| total + cnt)
    }
}

fn save_painted_pixels(
    source: [[u8; CANVAS_SIZE]; CANVAS_SIZE],
    destination: &mut [[u8; CANVAS_SIZE]; CANVAS_SIZE],
) {
    source
        .iter()
        .zip(destination)
        .for_each(|(upd_row, dst_row)| {
            upd_row
                .iter()
                .zip(dst_row)
                .filter(|(upd, _dst)| **upd != TRANSPARENT_COLOR)
                .for_each(|(upd, dst)| *dst = *upd);
        });
}

#[derive(Accounts)]
#[instruction(position: Point2d)]
pub struct Initialize<'info> {
    #[account(init, signer, payer = user, space = 8 + ACCOUNT_BYTES)]
    pub canvas: Account<'info, CanvasTile>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: `ErrorCode::InvalidTileAddress` thrown if manual check failed
    #[account(executable)]
    pub owner_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct CanvasData<'info> {
    #[account(
        mut,
        signer,
        seeds=[canvas.position.seed().as_bytes()],
        seeds::program=canvas.owner.key(),
        bump,
    )]
    pub canvas: Account<'info, CanvasTile>,
}

#[account]
pub struct CanvasTile {
    pub owner: Pubkey,
    pub position: Point2d,
    pub times_modified: u32,
    pub last_modified: i64,
    pub pixels: [[u8; CANVAS_SIZE]; CANVAS_SIZE],
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

    pub fn program_address(&self, program_id: &Pubkey) -> (Pubkey, u8, String) {
        let seed = self.seed();
        let seed_bytes = seed.as_bytes();

        let (authority, authority_bump) =
            Pubkey::find_program_address(&[seed_bytes], program_id);

        (authority, authority_bump, seed)
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Provided pixel tile address is incorrect")]
    InvalidTileAddress,
}

