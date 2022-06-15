const File = require('./models/file');
const fs = require('fs');

const connectDB = require('./config/db');
connectDB();

async function deleteOldFiles() {
  // 24 hrs before
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const files = await File.find({ createdAt: { $lt: pastDate } });

  if (files.length) {
    for (const file of files) {
      try {
        // remove original file from server
        fs.unlinkSync(file.path);

        // remove link from DB
        await file.remove();

        console.log(`Successfully Deleted ${file.filename}`);
      } catch (err) {
        console.log('Error while deleting file : ', err.message);
      }
    }
    console.log('Job Done.');
  }
}

deleteOldFiles().then(() => {
  process.exit();
});
