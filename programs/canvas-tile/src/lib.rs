use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use std::mem::size_of;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnQ");

const CANVAS_SIZE: usize = 16;
const TRANSPARENT_COLOR: u8 = u8::MAX;
const ACCOUNT_BYTES: usize = size_of::<CanvasTile>();

#[program]
pub mod canvas_tile {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, position: Point2d) -> Result<()> {
        ctx.accounts.canvas.position = position;

        Ok(())
    }

    pub fn draw_over(
        ctx: Context<CanvasData>,
        pixels: [[u8; CANVAS_SIZE]; CANVAS_SIZE],
    ) -> Result<()> {
        // TODO: make sure only trusted program could call it
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

    pub fn count_painted_pixels(pixels: [[u8; CANVAS_SIZE]; CANVAS_SIZE]) -> usize {
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
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + ACCOUNT_BYTES)]
    pub canvas: Account<'info, CanvasTile>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CanvasData<'info> {
    #[account(mut)]
    pub canvas: Account<'info, CanvasTile>,
}

#[account]
pub struct CanvasTile {
    pub position: Point2d,
    pub times_modified: u32,
    pub last_modified: i64,
    pub pixels: [[u8; CANVAS_SIZE]; CANVAS_SIZE],
}

#[derive(AnchorSerialize, AnchorDeserialize, Copy, Clone, Default, Debug)]
pub struct Point2d {
    pub x: u32,
    pub y: u32,
}
