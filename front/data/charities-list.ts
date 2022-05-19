import { PublicKey } from "@solana/web3.js";

export type CharitySummary = {
  id: string;
  name: string;
  solanaAddress: PublicKey;

  logoUrl: string;
  officialUrl: string;
  shortDescription: string;
};

export const defaultCharity = "ministry-of-digital";

export const charitiesList: CharitySummary[] = [
  {
    id: "palianytsia",

    solanaAddress: new PublicKey(
      "EuxEwa3XhawweggAAVA37snsGhEJ2vzxvoQSMkVNKRga"
    ),

    name: "Palianytsia ukrainian charity initiative",
    logoUrl: "/palianytsia.png",
    officialUrl: "https://palianytsia.com.ua/",

    shortDescription:
      "Help refugees and war victims. Shelter, humanitarian aid, delivery, psychological help.",
  },
  {
    id: "ministry-of-digital",

    solanaAddress: new PublicKey(
      "66pJhhESDjdeBBDdkKmxYYd7q6GUggYPWjxpMKNX39KV"
    ),

    name: "Ministry of Digital Transformation of Ukraine",
    logoUrl:
      "https://donate.thedigital.gov.ua/static/logo-e48ea93d770e370520fad32e653e4933.svg",
    officialUrl: "https://donate.thedigital.gov.ua/",

    shortDescription:
      "The donations will be used to help the Armed Forces of Ukraine as well as Ukrainian civilians in dire need of humanitarian aid.",
  },
  {
    id: "come-back-alive",

    solanaAddress: new PublicKey(
      "8icxpGYCoR8SRKqLYsSarcAjBjBPuXAuHkeJjJx5ju7a"
    ),

    name: "Come Back Alive",
    logoUrl: "/come-back-alive.png",
    officialUrl: "https://www.comebackalive.in.ua/",

    shortDescription:
      "Fund supports the Armed Forces of Ukraine through financing purely defence initiatives.",
  },
];
