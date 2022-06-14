const express = require('express');
const showRouter = express.Router();
const File = require('../models/file');

// To render download page showing file details
showRouter.get('/:uuid', async (req, res) => {
  try {
    const file_uuid = req.params.uuid;
    const file = await File.findOne({ uuid: file_uuid });

    if (!file) {
      return res.render('download', { error: 'Link Not Valid' });
    }

    return res.render('download', {
      uuid: file_uuid,
      fileName: file.name,
      fileSize: file.size,
      downloadLink: `${process.env.APP_BASE_URL}/files/download/${file_uuid}`,
    });
  } catch (err) {
    return res.render('download', { error: 'Something went wrong' });
  }
});

// To download the file after clicking download button
showRouter.get('/download/:uuid', async (req, res) => {
  try {
    const file_uuid = req.params.uuid;

    const file = await File.findOne({ uuid: file_uuid });

    if (!file) {
      return res.render('download', {
        error: 'Invalid Download Link',
      });
    }

    const filePath = `${__dirname}/../${file.path}`;
    res.download(filePath);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = showRouter;
