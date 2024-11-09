import { labeler } from "./labeler.js";
import { DID, JETSTREAM_URL } from "./constants.js";
import fs from "node:fs";
import { Jetstream } from "@skyware/jetstream";

let intervalID: NodeJS.Timeout;
let cursorFile;
if (fs.existsSync("cursor.txt")) {
  cursorFile = fs.readFileSync("cursor.txt", "utf8");
  if (cursorFile) console.log(`Initiate jetstream at cursor ${cursorFile}`);
} else {
  fs.openSync("cursor.txt", "a");
  cursorFile = fs.readFileSync("cursor.txt", "utf8");
}
if (cursorFile) console.log(`Initiate jetstream at cursor ${cursorFile}`);

const jetstream = new Jetstream({
  endpoint: JETSTREAM_URL,
  wantedCollections: ["app.bsky.feed.like"],
  cursor: Number(cursorFile),
});

jetstream.on("open", () => {
  intervalID = setInterval(() => {
    if (!jetstream.cursor) return;
    fs.writeFile("cursor.txt", jetstream.cursor.toString(), (err) => {
      if (err) console.log(err);
    });
  }, 60000);
});

jetstream.on("error", (err) => console.error(err));
jetstream.on("close", () => clearInterval(intervalID));

jetstream.onCreate("app.bsky.feed.like", (event) => {
  if (event.commit.record.subject.uri.includes(`${DID}/app.bsky.feed.post`))
    labeler(event.did, event.commit.record.subject.uri.split("/").pop()!);
});

jetstream.start();
