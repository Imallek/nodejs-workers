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
  const dbo = db.db(DB_NAME).collection(COLLECTION_NAME);
  let emails = await getRandomSample(dbo, SAMPLE_SIZE);
  await updateLastActivityOfDocuments(dbo, [...emails]);
  await getUpdatedActivityofDocuments(dbo, [...emails]);
});

async function updateLastActivityOfDocuments(db, array) {
  for (let i = 10; i > 0; i--) {
    let documentIndexToModify = getRandomNumber(i);
    let queryDoc = array.splice(documentIndexToModify, 1)[0];
    // console.log("DOCUMENT:  ", queryDoc);
    await modifyLastActivityTime(db, queryDoc, getRandomNumber(4, 1));
  }
}

async function getUpdatedActivityofDocuments(db, array) {
  let docs = await db
    .find({ email: { $in: array } })
    .project({ email: 1, "meta.lastLogin": 1 });
  docs.forEach((item) => console.log(item));
}

async function modifyLastActivityTime(db, docEmail, minutes) {
  //   console.log("DOC EMAIL: ", docEmail);
  //   console.log("Minutes: ", minutes);
  let updatedData = await db.updateOne(
    { email: docEmail },
    {
      $set: {
        "meta.lastLogin": new Date(new Date().getTime() - minutes * 60 * 1000),
      },
    }
  );
  //   let data = await db.findOne({ email: docEmail });
  //   console.log("Update Data: ", data.meta.lastLogin);
}

function getRandomNumber(size, base) {
  if (base == null) {
    return Math.floor(Math.random() * size);
  } else {
    return base + Math.floor(Math.random() * size);
  }
}

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
