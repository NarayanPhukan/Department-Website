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

// Root endpoint to prevent "Cannot GET /"
app.get('/', (req, res) => {
  res.send('CS Department API Server is running.');
});

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

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

app.post('/api/execute', (req, res) => {
  const { language, source } = req.body;
  
  if (!source) {
    return res.status(400).json({ error: 'No source code provided' });
  }

  const tmpDir = os.tmpdir();
  const fileId = uuidv4();
  
  let fileName, command;
  let javaDir = null;

  try {
    if (language === 'python') {
      fileName = path.join(tmpDir, `${fileId}.py`);
      command = `python3 ${fileName}`;
    } else if (language === 'javascript') {
      fileName = path.join(tmpDir, `${fileId}.js`);
      command = `node ${fileName}`;
    } else if (language === 'java') {
      javaDir = path.join(tmpDir, fileId);
      fs.mkdirSync(javaDir);
      // We assume the user's code uses "public class Main"
      fileName = path.join(javaDir, `Main.java`);
      command = `javac ${fileName} && java -cp ${javaDir} Main`;
    } else if (language === 'c') {
      fileName = path.join(tmpDir, `${fileId}.c`);
      const outName = path.join(tmpDir, `${fileId}`);
      const zigPath = fs.existsSync('/usr/local/bin/zig') ? '/usr/local/bin/zig' : '/home/zerosync/.local/bin/zig';
      command = `${zigPath} cc ${fileName} -o ${outName} && ${outName}`;
    } else if (language === 'cpp' || language === 'c++') {
      fileName = path.join(tmpDir, `${fileId}.cpp`);
      const outName = path.join(tmpDir, `${fileId}`);
      const zigPath = fs.existsSync('/usr/local/bin/zig') ? '/usr/local/bin/zig' : '/home/zerosync/.local/bin/zig';
      command = `${zigPath} c++ ${fileName} -o ${outName} && ${outName}`;
    } else if (language === 'bash') {
      fileName = path.join(tmpDir, `${fileId}.sh`);
      command = `bash ${fileName}`;
    } else if (language === 'perl') {
      fileName = path.join(tmpDir, `${fileId}.pl`);
      command = `perl ${fileName}`;
    } else {
      return res.status(400).json({ error: 'Unsupported language. Supported: python, javascript, java, c, cpp, bash, perl.' });
    }

    fs.writeFile(fileName, source, (err) => {
      if (err) return res.status(500).json({ error: 'Failed to create temp file' });
      
      // Execute with a timeout of 5 seconds to prevent infinite loops
      exec(command, { timeout: 5000 }, (execErr, stdout, stderr) => {
        // Clean up temp files
        try {
          if (javaDir) {
            fs.rmSync(javaDir, { recursive: true, force: true });
          } else {
            fs.unlink(fileName, () => {});
            if (language === 'c' || language === 'cpp' || language === 'c++') {
              fs.unlink(path.join(tmpDir, `${fileId}`), () => {});
            }
          }
        } catch (cleanupErr) {
          console.error("Cleanup error:", cleanupErr);
        }
        
        let runOutput = '';
        if (execErr && execErr.killed) {
          runOutput = 'Error: Execution timed out (exceeded 5 seconds).';
        } else if (execErr) {
          // Failure (e.g. compile error)
          runOutput = stderr || stdout || execErr.message;
        } else {
          // Success
          runOutput = stdout || '';
          if (stderr && !stdout) {
            runOutput = stderr;
          }
        }
        
        res.json({
          run: {
            output: runOutput,
            code: execErr ? 1 : 0
          }
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
