var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

const DB_NAME = "CreativeMorph";
const COLLECTION_NAME = "Users";
const SAMPLE_SIZE = 10;

MongoClient.connect(url, { useUnifiedTopology: true }, async function (
  err,
  db
) {
  if (err) throw err;
  const dbo = db.db(DB_NAME);
  let emails = await getRandomSample(
    dbo.collection(COLLECTION_NAME),
    SAMPLE_SIZE
  );
  console.log(emails);
});

async function getRandomSample(db, sampleSize) {
  const total = await db.countDocuments();
  const numSamples = sampleSize;
  const emails = [];

  for (i = 0; i < numSamples; i++) {
    let random = Math.floor(Math.random() * total);
    let cursor = await db.find().skip(random).limit(1);
    let user = await cursor.next();
    emails.push(user.email);
  }

  return emails;
}
