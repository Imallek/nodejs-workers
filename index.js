var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

const DB_NAME = "CreativeMorph";
const COLLECTION_NAME = "Users";
const SAMPLE_SIZE = 10;
const LastActivityLessThan_5minutes = [];
const LastActivityLessThan_3minutes = [];
const LastActivityLessThan_2minutes = [];

MongoClient.connect(url, { useUnifiedTopology: true }, async function (
  err,
  db
) {
  if (err) throw err;
  const dbo = db.db(DB_NAME).collection(COLLECTION_NAME);
  let emails = await getRandomSample(dbo, SAMPLE_SIZE);
  await updateLastActivityOfDocuments(dbo, [...emails]);
  //   await getUpdatedActivityofDocuments(dbo, [...emails]);
  await classifyDocsOverLastActivity(dbo, [2, 3, 5]);
  console.log(
    "Users having last Activity is b/w 1-2 minutes, (Check other Arrays for 2-3 and 4-5 minutes Users)",
    LastActivityLessThan_2minutes
  );

  setInterval(async () => {
    await classifyDocsOverLastActivity(dbo, [2, 3, 5]);
    console.log(
      "Users having last Activity is b/w 1-2 minutes, (Check other Arrays for 2-3 and 4-5 minutes Users)",
      LastActivityLessThan_2minutes
    );
  }, 5 * 60 * 1000);
});

async function updateLastActivityOfDocuments(db, array) {
  for (let i = 10; i > 0; i--) {
    let documentIndexToModify = getRandomNumber(i);
    let queryDoc = array.splice(documentIndexToModify, 1)[0];
    await modifyLastActivityTime(db, queryDoc, getRandomNumber(4, 1));
  }
}

async function getUpdatedActivityofDocuments(db, array) {
  let docs = await db
    .find({ email: { $in: array } })
    .project({ email: 1, "meta.lastActivity": 1 });
  docs.forEach((item) => console.log(item));
}

async function modifyLastActivityTime(db, docEmail, minutes) {
  let updatedData = await db.updateOne(
    { email: docEmail },
    {
      $set: {
        "meta.lastActivity": new Date(
          new Date().getTime() - minutes * 60 * 1000
        ),
      },
    }
  );
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

async function classifyDocsOverLastActivity(db, minutesArray) {
  await classifyDocs(
    db,
    minutesArray[0] - 1,
    minutesArray[0],
    LastActivityLessThan_2minutes
  );
  await classifyDocs(
    db,
    minutesArray[1] - 1,
    minutesArray[1],
    LastActivityLessThan_3minutes
  );
  await classifyDocs(
    db,
    minutesArray[2] - 1,
    minutesArray[2],
    LastActivityLessThan_5minutes
  );
}

async function classifyDocs(db, minutesLower, minutesUpper, store) {
  let documents = await db
    .find({
      "meta.lastActivity": {
        $gte: new Date(new Date().getTime() - minutesUpper * 60 * 1000),
        $lt: new Date(new Date().getTime() - minutesLower * 60 * 1000),
      },
    })
    .project({ email: 1, "meta.lastActivity": 1 });

  await documents.forEach((item) => {
    store.push(item);
  });
}
