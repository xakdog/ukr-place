import { expect } from 'chai';
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { UkrPlace } from "../target/types/ukr_place";
import { Helpers } from "./helpers";

const PRICE_PER_PIXEL = 2_500_000;
const DONATE_PUBLIC_KEY = new PublicKey("66pJhhESDjdeBBDdkKmxYYd7q6GUggYPWjxpMKNX39KV");

describe("ukr_place", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.UkrPlace as Program<UkrPlace>;
  const jsonRpc = program.provider.connection;
  const helpers = new Helpers(program);

  it("Should init CanvasTile", async () => {
    const point = { x: 0, y: 0 };
    const myMoney = anchor.web3.Keypair.generate();

    await helpers.airdropSol(myMoney.publicKey, 0.7);
    await helpers.initCanvasTile(myMoney, point);
  });

  it("Should buy 144 pixels and transfer money to https://donate.thedigital.gov.ua/", async () => {
    const pixels = 144;
    const price = pixels * PRICE_PER_PIXEL;
    const myMoney = anchor.web3.Keypair.generate();
    const myPixels = anchor.web3.Keypair.generate();

    await helpers.airdropSol(DONATE_PUBLIC_KEY, 3);
    await helpers.airdropSol(myMoney.publicKey, 3.7);

    const accountBefore = await jsonRpc.getAccountInfo(DONATE_PUBLIC_KEY);

    await helpers.initPixelWallet(myMoney, myPixels);
    await helpers.buyPixels(myMoney, myPixels, DONATE_PUBLIC_KEY, pixels);

    const accountAfter = await jsonRpc.getAccountInfo(DONATE_PUBLIC_KEY);

    expect(accountAfter.lamports).equal(accountBefore.lamports + price);

    const { availablePixels } = await helpers.getAvailablePixels(myPixels);
    expect(availablePixels).to.be.equal(pixels);
  });

  it("Should paint a pixel on the canvas", async () => {
    const pixelsCount = 24;
    const point = { x: 0, y: 16 };
    const myMoney = anchor.web3.Keypair.generate();
    const myPixels = anchor.web3.Keypair.generate();

    await helpers.airdropSol(myMoney.publicKey, 0.7);

    // console.log("myMoney:", myMoney.publicKey.toBase58());
    // console.log("myPixels:", myPixels.publicKey.toBase58());

    await helpers.initPixelWallet(myMoney, myPixels);
    await helpers.buyPixels(myMoney, myPixels, DONATE_PUBLIC_KEY, pixelsCount);

    const { pda } = await helpers.initCanvasTile(myMoney, point);

    const row = [...Array(16)].map(() => 0);
    const image = [...Array(16)].map(() => row);

    {
      const placedPixels = [23, 23, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const resultPixels = [23, 23, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      image[0] = placedPixels;

      await helpers.paintPixels(myMoney, myPixels, point, image);
      await helpers.paintPixels(myMoney, myPixels, point, image);

      const { pixels } = await helpers.getCanvasPixels(point);
      const { availablePixels } = await helpers.getAvailablePixels(myPixels);

      expect(pixels[0]).to.be.deep.equal(resultPixels);
      expect(availablePixels).to.be.equal(pixelsCount - 4);
    }

    {
      const placedPixels = [0, 0, 0, 0, 99, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const resultPixels = [23, 23, 0, 0, 99, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      image[0] = placedPixels;
      await helpers.paintPixels(myMoney, myPixels, point, image);

      const { pixels } = await helpers.getCanvasPixels(point);
      const { availablePixels } = await helpers.getAvailablePixels(myPixels);

      expect(pixels[0]).to.be.deep.equal(resultPixels);
      expect(availablePixels).to.be.equal(pixelsCount - 6);
    }
  });
});
