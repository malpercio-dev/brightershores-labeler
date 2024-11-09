import "dotenv/config";

export const DID = process.env.DID ?? "";
export const SIGNING_KEY = process.env.SIGNING_KEY ?? "";
export const PORT = Number(process.env.PORT ?? 4001);
export const JETSTREAM_URL = process.env.JETSTREAM_URL ?? "wss://jetstream.atproto.tools/subscribe";
export const MAXLABELS = 1;
export const DELETE = "3kwsqucto3j2a";
export const POSTS: Record<string, string> = {
};