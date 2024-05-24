const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
const { Readable } = require('stream');

const KEY_FILE_PATH = path.join("some-service-account.json");

const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE_PATH,
  scopes: SCOPES,
});

const busboy = require('busboy');

exports.uploadFile = async (req, res) => {
  try {
    const bb = busboy({ headers: req.headers });

    bb.on('file', async (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      console.log(
        `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
        filename,
        encoding,
        mimeType
      );

      const buffers = [];

      file.on('data', (data) => {
        buffers.push(data);
      });

      file.on('end', async () => {
        const fileBuffer = Buffer.concat(buffers);
        const fileStream = Readable.from(fileBuffer); // Create a readable stream from the Buffer

        const { data } = await google
          .drive({ version: 'v3', auth: auth })
          .files.create({
            media: {
              mimeType: mimeType,
              body: fileStream, // Pass the readable stream as the request body
            },
            requestBody: {
              name: filename,
              parents: ['1HyWYUFaaBJxKXZS4-8YvNDG3J5DDJll2'], //folder id in which file should be uploaded
            },
            fields: 'id,name',
          });

        console.log(`File uploaded successfully -> ${JSON.stringify(data)}`);
        res.json({ status: 1, message: 'success', file_id: data.id, file_name: data.name });
      });
    });

    bb.on('close', () => {
      console.log('Done parsing form!');
    });

    req.pipe(bb);
  } catch (error) {
    console.log(error);
    res.json({ status: -1, message: 'failure', err: error.message });
  }
};
// exports.uploadFile = async (req, res) => {
//   try {
//     const bb = busboy({ headers: req.headers });

//     bb.on('file', async (name, file, info) => {
//       const { filename, encoding, mimeType } = info;
//       console.log(
//         `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
//         filename,
//         encoding,
//         mimeType
//       );

//       const buffers = [];

//       file.on('data', (data) => {
//         buffers.push(data);
//       });

//       file.on('end', async () => {
//         const fileBuffer = Buffer.concat(buffers);

//         const { data } = await google
//           .drive({ version: 'v3', auth: auth })
//           .files.create({
//             media: {
//               mimeType: mimeType,
//               body: fileBuffer,
//             },
//             requestBody: {
//               name: filename,
//               parents: ['1HyWYUFaaBJxKXZS4-8YvNDG3J5DDJll2'], //folder id in which file should be uploaded
//             },
//             fields: 'id,name',
//           });

//         console.log(`File uploaded successfully -> ${JSON.stringify(data)}`);
//         res.json({ status: 1, message: 'success', file_id: data.id, file_name: data.name });
//       });
//     });

//     bb.on('close', () => {
//       console.log('Done parsing form!');
//     });

//     req.pipe(bb);
//   } catch (error) {
//     console.log(error);
//     res.json({ status: -1, message: 'failure', err: error.message });
//   }
// };

exports.getFiles = async (req, res) => {
  const folderId = "1sbOZRoTLQjXuqPMSom78YjPG8DL3WpH5"; // Replace with your folder ID

  try {
    const response = await google
      .drive({ version: "v3", auth: auth })
      .files.list({
        q: `'${folderId}' in parents and mimeType='application/pdf'`,
        fields: "files(id, name, webContentLink)",
      });
    // const files = response.data.files;
    const files = response.data.files.map(file => ({
        id: file.id,
        name: file.name,
        downloadLink: file.webContentLink,
    }));
    res.status(200).json(files);
  } catch (error) {
    res.status(500).send(error.toString());
  }
};


// exports.uploadFile = async (req, res) => {
//   try {
//     const { file } = req;

//     const { data } = await google
//       .drive({ version: "v3", auth: auth })
//       .files.create({
//         media: {
//           mimeType: file.mimeType,
//           body: fs.createReadStream(file.path),
//         },
//         requestBody: {
//           name: file.originalname,
//           parents: ["1HyWYUFaaBJxKXZS4-8YvNDG3J5DDJll2"], //folder id in which file should be uploaded
//         },
//         fields: "id,name",
//       });

//     console.log(`File uploaded successfully -> ${JSON.stringify(data)}`);

//     res.json({
//       status: 1,
//       message: "success",
//       file_id: data.id,
//       file_name: data.name,
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({ status: -1, message: "failure", err: error.message });
//   }
// };
