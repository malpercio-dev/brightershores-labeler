import "dotenv/config";

export const DID = process.env.DID ?? "";
export const SIGNING_KEY = process.env.SIGNING_KEY ?? "";
export const PORT = Number(process.env.PORT ?? 4001);
export const JETSTREAM_URL = process.env.JETSTREAM_URL ?? "wss://jetstream.atproto.tools/subscribe";
export const MAXLABELS = 1;
export const DELETE = "3lakcctf5qk2t";
export const POSTS: Record<string, string> = {
    "3lakcewd2r22u": "guardian",
    "3lakcewd2r32u": "cryoknight",
    "3lakcewd3qd2u": "hammermage"
};