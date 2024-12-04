import { labeler } from "./labeler.js";
import { DID, JETSTREAM_URL } from "./constants.js";
import fs from "node:fs";
import { Jetstream } from "@skyware/jetstream";

console.log('starting application')

let intervalID: NodeJS.Timeout;
let cursorFile;
if (fs.existsSync("cursor.txt")) {
  console.log('reading existing cursor')
  cursorFile = fs.readFileSync("cursor.txt", "utf8");
  if (cursorFile) console.log(`Initiate jetstream at cursor ${cursorFile}`);
} else {
  console.log('creating cursor file')
  fs.openSync("cursor.txt", "a");
  cursorFile = fs.readFileSync("cursor.txt", "utf8");
}
if (cursorFile) console.log(`Initiate jetstream at cursor ${cursorFile}`);

console.log('initiating jetstream')
const jetstream = new Jetstream({
  endpoint: JETSTREAM_URL,
  wantedCollections: ["app.bsky.feed.like"],
  cursor: Number(cursorFile),
});

jetstream.on("open", () => {
  console.log('setting up cursor interval')
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

console.log('starting jetstream')
jetstream.start();
console.log('jetstream started')
