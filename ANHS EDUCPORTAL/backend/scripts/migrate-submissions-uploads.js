require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const AssignmentSubmission = require('../src/models/AssignmentSubmission');
const Upload = require('../src/models/Upload');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  await mongoose.connect(uri, { autoIndex: true });

  const submissions = await AssignmentSubmission.find({
    fileUrl: { $exists: true, $ne: null },
    uploadId: { $exists: false }
  });

  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  let migrated = 0;

  for (const submission of submissions) {
    const filename = submission.fileUrl ? path.basename(submission.fileUrl) : null;
    if (!filename) continue;

    const filePath = path.join(uploadDir, filename);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const uploadDoc = await Upload.create({
      filename,
      originalName: submission.fileName || filename,
      mimeType: submission.mimeType,
      size: submission.size,
      url: submission.fileUrl
    });

    submission.uploadId = uploadDoc._id;
    await submission.save();
    migrated += 1;
  }

  console.log(`Migration complete. Updated ${migrated} submissions.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
