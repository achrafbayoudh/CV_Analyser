require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
const mysql = require("mysql2/promise"); // Using promise-based version

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const upload = multer({ dest: "uploads/" });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Job offers will be read from MySQL table `jobs` (columns: title, skills)

function normalizeSkills(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((s) => (typeof s === 'string' ? s : String(s || '')))
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function computeMatch(candidateSkills, jobSkills) {
  const cand = new Set(normalizeSkills(candidateSkills));
  const job = normalizeSkills(jobSkills);
  if (job.length === 0) return { score: 0, matched: [] };
  const matched = job.filter((skill) => cand.has(skill));
  const score = Math.round((matched.length / job.length) * 100);
  return { score, matched };
}


async function storeCVData(cvData) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();


    const [result] = await connection.execute(
      `INSERT INTO cvs (
        name, 
        email, 
        skills, 
        experience, 
        education, 
        summary,
        created_at,
        job_title
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(),?)`,
      [
        cvData.name || null,
        cvData.email || null,
        cvData.skills ? JSON.stringify(cvData.skills) : null,
        cvData.experience ? JSON.stringify(cvData.experience) : null,
        cvData.education ? JSON.stringify(cvData.education) : null,
        cvData.summary || null,
        cvData.job_title || null
      ]
    );

    const cvId = result.insertId;


    await connection.commit();
    return cvId;
  } catch (error) {

    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

app.post("/api/analyze", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file received." });
  }

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  let text = "";

  try {
    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else if (ext === ".docx") {
      const { value } = await mammoth.extractRawText({ path: filePath });
      text = value;
    } else {
      return res.status(400).json({ error: "Unsupported file format. Use PDF or DOCX." });
    }
  } catch (err) {
    console.error("Text extraction failed:", err);
    return res.status(500).json({ error: "Failed to extract text from file." });
  }

  try {
    const prompt = `
      Extract the following information from this CV and format as valid JSON:
      {
        "name": "string",
        "email": "string",
        "skills": ["array", "of", "strings"],
        "experience": [
          {
            "title": "string",
            "company": "string",
            "duration": "string"
          }
        ],
        "education": [
          {
            "degree": "string",
            "institution": "string",
            "year": "string"
          }
        ],
        "summary": "string"
      }
      
      CV TEXT:
      ${text}
    `;

    console.log("Sending to Gemini API...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    console.log("Received Gemini response:", response);

    let parsed;
    try {
      let responseText = response.text;
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/```json|```/g, '').trim();
      }
      
      parsed = JSON.parse(responseText);
      console.log("Successfully parsed JSON:", parsed);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      console.error("Original response text:", response.text);
      parsed = { 
        summary: response.text,
        error: "Failed to parse full response"
      };
    }

    if (!parsed.name || !parsed.email) {
      console.warn("Missing required fields in parsed data");
    }

    
    if (req.body && typeof req.body.job_title !== 'undefined') {
      parsed.job_title = req.body.job_title || null;
    }

    try {
      const cvId = await storeCVData(parsed);
      console.log("Successfully stored CV with ID:", cvId);
      
      res.json({
        success: true,
        message: "CV analyzed and stored successfully",
        cvId: cvId,
        data: parsed
      });
    } catch (dbError) {
      console.error("Database storage failed:", dbError);
      res.status(500).json({ 
        error: "CV analysis succeeded but storage failed",
        analysisData: parsed,
        storageError: dbError.message 
      });
    }
    
} catch (err) {
    console.error("CV processing error:", err);
    
    const errorResponse = {
      error: "CV processing failed",
      details: err.message
    };
    
    if (err.response) {
      errorResponse.apiError = {
        status: err.response.status,
        data: err.response.data
      };
    }
    
    res.status(500).json(errorResponse);
} finally {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Temporary file deleted successfully");
      }
    } catch (cleanupError) {
      console.error("Failed to delete temporary file:", cleanupError);
    }
}
});

// Return all stored CVs with parsed JSON fields
app.get("/api/cvs", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, skills, experience, education, summary, job_title, created_at
       FROM cvs
       ORDER BY created_at DESC`
    );

    const parsed = rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      skills: (() => { try { return r.skills ? JSON.parse(r.skills) : []; } catch { return []; } })(),
      experience: (() => { try { return r.experience ? JSON.parse(r.experience) : []; } catch { return []; } })(),
      education: (() => { try { return r.education ? JSON.parse(r.education) : []; } catch { return []; } })(),
      summary: r.summary,
      job_title: r.job_title,
      created_at: r.created_at
    }));

    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error("Failed to fetch CVs:", err);
    res.status(500).json({ error: "Failed to fetch CVs" });
  }
});


app.get("/api/ranking", async (req, res) => {
  try {
    
    const [rows] = await pool.query(
      `SELECT id, name, email, skills, job_title, created_at FROM cvs`
    );

    const candidates = rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      job_title: r.job_title,
      created_at: r.created_at,
      skills: (() => { try { return r.skills ? JSON.parse(r.skills) : []; } catch { return []; } })()
    }));

    
    const [jobRows] = await pool.query(
      `SELECT title, skills FROM jobs`
    );

    const jobs = jobRows.map((j) => ({
      title: j.title,
      skills: (() => { try { return j.skills ? JSON.parse(j.skills) : []; } catch { return []; } })()
    }));

    const result = jobs.map((job) => {
      const jobTitleLower = (job.title || '').toLowerCase();
      const required = job.skills || [];
      const ranked = candidates
        .filter((cv) => (cv.job_title || '').toLowerCase() === jobTitleLower)
        .map((cv) => {
          const { score, matched } = computeMatch(cv.skills, required);
          return { id: cv.id, name: cv.name, email: cv.email, score, matched, created_at: cv.created_at };
        })
        .sort((a, b) => b.score - a.score);
      return { job_title: job.title, required_skills: required, candidates: ranked };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Failed to compute ranking:", err);
    res.status(500).json({ error: "Failed to compute ranking" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});