const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const KEY_FILE_PATH = path.join("some-service-account.json");

const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE_PATH,
  scopes: SCOPES,
});

exports.uploadFile = async (req, res) => {
  try {
    const { file } = req;

    const { data } = await google
      .drive({ version: "v3", auth: auth })
      .files.create({
        media: {
          mimeType: file.mimeType,
          body: fs.createReadStream(file.path),
        },
        requestBody: {
          name: file.originalname,
          parents: ["1HyWYUFaaBJxKXZS4-8YvNDG3J5DDJll2"], //folder id in which file should be uploaded
        },
        fields: "id,name",
      });

    console.log(`File uploaded successfully -> ${JSON.stringify(data)}`);

    res.json({
      status: 1,
      message: "success",
      file_id: data.id,
      file_name: data.name,
    });
  } catch (error) {
    console.log(error);
    res.json({ status: -1, message: "failure", err: error.message });
  }
};

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
