import {PublicKey, LAMPORTS_PER_SOL, Keypair} from "@solana/web3.js";
import {Program, Provider} from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";

import { UkrPlace } from "../target/types/ukr_place";
import { CanvasTile } from "../target/types/canvas_tile";

type Point2d = { x: number, y: number };

export class Helpers {
  private jsonRpc: Provider['connection'];

  public solToLamports = (amount: number) => Math.floor(amount * LAMPORTS_PER_SOL);
  public lamportsToSol = (lamports: number) => lamports / LAMPORTS_PER_SOL;

  constructor<T>(program: Program<T>) {
    this.jsonRpc = program.provider.connection;
  }

  public async airdropSol(key: PublicKey, sol: number) {
    const lamports = this.solToLamports(sol);
    const sig = await this.jsonRpc.requestAirdrop(key, lamports);
    await this.jsonRpc.confirmTransaction(sig);
  }

  public async getBalance(key: PublicKey) {
    const account = await this.jsonRpc.getAccountInfo(key);

    return this.lamportsToSol(account.lamports);
  }

  public async initPixelWallet(payer: Keypair, pixels: Keypair) {
    const program = anchor.workspace.UkrPlace as Program<UkrPlace>;

    await program.methods.initialize()
      .accounts({
        user: payer.publicKey,
        pixelWallet: pixels.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer, pixels])
      .rpc();
  }

  public async buyPixels(payer: Keypair, pixels: Keypair, charity: PublicKey, amount: number) {
    const program = anchor.workspace.UkrPlace as Program<UkrPlace>;

    const sig = await program.methods
      .buyPixels(amount as any)
      .accounts({
        charity,
        user: payer.publicKey,
        pixelWallet: pixels.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

    await this.jsonRpc.confirmTransaction(sig);
  }

  public async getAvailablePixels(pixels: Keypair) {
    const program = anchor.workspace.UkrPlace as Program<UkrPlace>;
    const pixWalletData = await program.account.pixelWallet.fetch(pixels.publicKey);

    const availablePixels = pixWalletData.availablePixels.toNumber();

    return { availablePixels };
  }

  public async paintPixels(payer: Keypair, pixels: Keypair, position: Point2d, image: number[][]) {
    const program = anchor.workspace.UkrPlace as Program<UkrPlace>;
    const tileProgram = anchor.workspace.CanvasTile as Program<CanvasTile>;

    const seed = `canvas-tile-${position.x}:${position.y}`;
    const [pda,] = await PublicKey.findProgramAddress([seed], program.programId);

    const sig = await program.methods
      .paintPixels(position as any, image as any)
      .accounts({
        tile: pda,
        tileProgram: tileProgram.programId,
        currentProgram: program.programId,

        user: payer.publicKey,
        pixelWallet: pixels.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([pixels, payer])
      .rpc();

    await this.jsonRpc.confirmTransaction(sig);
  }

  public async initCanvasTile(feePayer: Keypair, point: Point2d) {
    const program = anchor.workspace.UkrPlace as Program<UkrPlace>;

    const seed = `canvas-tile-${point.x}:${point.y}`;
    const [pda, bump] = await PublicKey.findProgramAddress([seed], program.programId);

    const sig = await program.methods
      .createTile(point as any)
      .accounts({
        tile: pda,
        tileProgram: anchor.workspace.CanvasTile.programId,
        ownerProgram: anchor.workspace.UkrPlace.programId,
        user: feePayer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([feePayer])
      .rpc();

    await this.jsonRpc.confirmTransaction(sig);

    return { pda, bump };
  }

  public async getEveryTile() {
    const program = anchor.workspace.CanvasTile as Program<CanvasTile>;

    return this.jsonRpc.getParsedProgramAccounts(program.programId);
  }

  public async getCanvasData(point: Point2d) {
    const UrkPlace = anchor.workspace.UkrPlace as Program<UkrPlace>;
    const CanvasTile = anchor.workspace.CanvasTile as Program<CanvasTile>;

    const seed = `canvas-tile-${point.x}:${point.y}`;
    const [pda,] = await PublicKey.findProgramAddress([seed], UrkPlace.programId);

    return CanvasTile.account.canvasTile.fetch(pda);
  }

  public async getCanvasPixels(point: Point2d) {
    const data = await this.getCanvasData(point);

    const pixels = [...data.pixels];
    const prettyPrint = () => {
      const grid = data.pixels.map(
        row => row.map(val => val.toString().padStart(3)).join(',')
      );

      return grid.join('\n');
    }

    return { pixels, prettyPrint, data };
  }
}
