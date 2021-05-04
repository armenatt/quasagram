// dependencies
const express = require("express");
const admin = require("firebase-admin");
let inspect = require("util").inspect;
let Busboy = require("busboy");
let path = require("path");
let os = require("os");
let fs = require("fs");
let UUID = require("uuid-v4");

// config - express
const app = express();

// firebase - config

const serviceAccount = require("./config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "quasagram-42bd1.appspot.com"
});

const db = admin.firestore();
let bucket = admin.storage().bucket();

// config - port
const port = process.env.PORT || 3000;

// endpoint - posts
app.get("/posts", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  let posts = [];
  db.collection("posts")
    .orderBy("date", "desc")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        posts.push(doc.data());
      });
      res.status(200).send(posts);
    });
});

// endpoint - createPost
app.post("/createpost", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  let uuid = UUID();

  var fields = {};
  let fileData = {};

  var busboy = new Busboy({ headers: req.headers });
  busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
    console.log(
      "File [" +
        fieldname +
        "]: filename: " +
        filename +
        ", encoding: " +
        encoding +
        ", mimetype: " +
        mimetype
    );
    // /tmp/
    let filePath = path.join(os.tmpdir(), filename);
    file.pipe(fs.createWriteStream(filePath));
    fileData = { filePath, mimetype };
  });
  busboy.on("field", function(
    fieldname,
    val,
    fieldnameTruncated,
    valTruncated,
    encoding,
    mimetype
  ) {
    fields[fieldname] = val;
  });
  busboy.on("finish", function() {
    bucket.upload(
      fileData.filePath,
      {
        uploadType: "media",
        metadata: {
          metadata: {
            contentType: fileData.mimetype,
            firebaseStorageDownloadTokens: uuid
          }
        }
      },
      (err, uploadedFile) => {
        if (!err) {
          createDocument(uploadedFile);
        }
      }
    );

    function createDocument(uploadedFile) {
      db.collection("posts")
        .doc(fields.id)
        .set({
          id: fields.id,
          caption: fields.caption,
          date: parseInt(fields.date),
          location: fields.location,
          imageUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${uploadedFile.name}?alt=media&token=${uuid}`
        })
        .then(() => {
          response.status(200).send("Post added" + fields.id);
        });
    }
    res.end();
  });
  req.pipe(busboy);
});

// listen
app.listen(port, () => {
  console.log("Server up and running at http://localhost:" + port);
});
