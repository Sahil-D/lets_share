const express = require('express');
const multer = require('multer');
const path = require('path');
const File = require('./../models/file');
const { v4: uuid4 } = require('uuid');
const sendMail = require('../services/emailService');
const emailTemplate = require('../services/emailTemplate');

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique_filename = `${Date.now()}-${Math.round(
      Math.random() * 1e8
    )}${path.extname(file.originalname)}`;
    cb(null, unique_filename);
  },
});

let upload = multer({
  storage,
  limits: { fileSize: 1000000 * 100 },
  // max_file_size in bytes (approx 100 MB using here)
}).single('myfile');

// .single() as we are uploading a single file only
// there are other functions also

const fileRouter = express.Router();

// Upload file endpoint
fileRouter.post('/', async (req, res) => {
  try {
    // Store file
    upload(req, res, async (err) => {
      // Validating request
      if (!req.file) {
        return res.json({
          message: 'File not found',
        });
      }

      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      // Store the filename to DB
      const file = new File({
        filename: req.file.filename,
        uuid: uuid4(),
        path: req.file.path, // req.file comes after multer installation
        size: req.file.size,
      });

      const response = await file.save();
      return res.json({
        file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
      });
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});

fileRouter.post('/send', async (req, res) => {
  try {
    const { uuid, emailTo, emailFrom } = req.body;

    if (!uuid || !emailTo || !emailFrom) {
      return res.status(422).json({ error: 'All fields are required' });
    }

    // Getting file from DB
    const file = await File.findOne({ uuid: uuid });

    if (!file) {
      return res.status(500).json({ error: 'No file found' });
    }

    if (file.sender) {
      return res.status(422).json({ error: 'File already sent' });
    }

    // Send Email
    let mail_sent = await sendMail({
      from: emailFrom,
      to: emailTo,
      subject: `File Shared by ${emailFrom} via Let's Share`,
      text: '',
      html: emailTemplate({
        emailFrom,
        downloadLink: `${process.env.APP_BASE_URL}/files/${uuid}`,
        size: parseInt(file.size / 1000, 10) + 'KB',
        expires: '24 hrs',
      }),
    });

    if (mail_sent) {
      // Save sender details
      file.sender = emailFrom;
      file.receiver = emailTo;

      await file.save();

      return res.json({
        message: 'Mail Sent.',
        success: true,
      });
    } else {
      return res.json({
        message: 'Error occured while sending email.',
      });
    }
  } catch (err) {
    return res.json({
      message: 'Error occured while sending email.',
    });
  }
});

module.exports = fileRouter;
