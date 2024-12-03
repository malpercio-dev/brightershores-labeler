import { ComAtprotoLabelDefs } from "@atcute/client/lexicons";
import {
  DID,
  PORT,
  MAXLABELS,
  POSTS,
  SIGNING_KEY,
  DELETE,
} from "./constants.js";
import { LabelerServer } from "@skyware/labeler";

const server = new LabelerServer({
  did: DID,
  signingKey: SIGNING_KEY,
  dbPath: "./data/labels.db",
});
server.app.get('/.well-known/did.json', (req, res) => {
  res.send({
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/multikey/v1",
      "https://w3id.org/security/suites/secp256k1-2019/v1"
    ],
    "id": "did:web:brightershores.malpercio.dev",
    "alsoKnownAs": [
      "at://brightershores.malpercio.dev"
    ],
    "verificationMethod": [
      {
        "id": "did:web:brightershores.malpercio.dev#atproto",
        "type": "Multikey",
        "controller": "did:web:brightershores.malpercio.dev",
        "publicKeyMultibase": "zDnaejUT7PJpdrFFt9ccGohj3L78TwzeGcku5cEpqtVCn4NRt"
      }
    ],
    "service": [
      {
        "id": "#atproto_pds",
        "type": "AtprotoPersonalDataServer",
        "serviceEndpoint": "https://pds.malpercio.dev"
      }
    ]
  })
});
server.start(PORT, (error, address) => {
  if (error) console.error(error);
  else console.log(`Labeler server listening on ${address}`);
});

export const labeler = async (did: string, rkey: string) => {
  const query = await server.db
    .execute({
      sql: `SELECT * FROM labels WHERE uri = ?`,
      args: [did],
    });

  const labels = query.rows.reduce((set, label) => {
    if (!label.neg) set.add(label.val!.toString());
    else set.delete(label.val!.toString());
    return set;
  }, new Set<string>());

  try {
    if (rkey.includes(DELETE)) {
      server.createLabels({ uri: did }, { negate: [...labels] });
      console.log(`${new Date().toISOString()} Deleted labels: ${did}`);
    } else if (labels.size < MAXLABELS && POSTS[rkey]) {
      server.createLabel({ uri: did, val: POSTS[rkey] });
      console.log(`${new Date().toISOString()} Labeled ${did}: ${POSTS[rkey]}`);
    }
  } catch (err) {
    console.error(err);
  }
};
