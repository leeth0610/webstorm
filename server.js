const express = require('express');
const app = express();
app.listen(52273);

const imageUpload = require('./imageupload');
app.post('/', imageUpload);

