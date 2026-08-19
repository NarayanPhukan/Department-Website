const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Cloudinary Setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for handling file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Basic Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running normally.' });
});

// Example Cloudinary Upload Endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'department_website'
    });

    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

app.post('/api/upload-document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'department_website/syllabi',
      resource_type: 'auto'
    });

    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    console.error('Upload Document Error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
