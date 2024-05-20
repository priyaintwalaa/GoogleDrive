const express = require('express');
const uploadRouter = require("./routes/upload.route")

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/", uploadRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});