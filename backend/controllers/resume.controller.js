const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

const SKILLS_LIST = [
  'javascript','typescript','python','java','c++','c#','ruby','go','php','swift',
  'react','angular','vue','nextjs','nodejs','express','django','flask','spring',
  'mongodb','mysql','postgresql','redis','firebase','sql','nosql',
  'aws','azure','docker','kubernetes','git','linux','bash',
  'html','css','sass','tailwind','bootstrap','graphql','rest','api',
  'machine learning','deep learning','tensorflow','pytorch','pandas','numpy',
  'react native','flutter','android','ios','figma','agile','scrum',
];

async function extractText(filePath, ext) {
  const buf = fs.readFileSync(filePath);
  if (ext === 'pdf') return (await pdfParse(buf)).text;
  const result = await mammoth.extractRawText({ buffer: buf });
  return result.value;
}

function parseResume(text) {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{8,14}\d)/);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const lower = text.toLowerCase();

  const skills = SKILLS_LIST.filter(s => new RegExp(`\\b${s.replace(/\+/g,'\\+')}\\b`, 'i').test(lower));

  return {
    name: lines[0] || '',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0].trim() : '',
    skills,
    wordCount: text.split(/\s+/).length,
    hasSections: ['experience','education','skills','projects'].filter(s => lower.includes(s)).length,
  };
}

function scoreResume(parsed, jobSkills = []) {
  // Skills match (40)
  const resumeSkillSet = new Set(parsed.skills.map(s => s.toLowerCase()));
  const matched = jobSkills.filter(s => resumeSkillSet.has(s.toLowerCase()));
  const skillScore = jobSkills.length > 0
    ? Math.round((matched.length / jobSkills.length) * 40)
    : Math.min(parsed.skills.length * 4, 40);

  // Experience (30) — based on word count & content
  const expScore = Math.min(Math.round((parsed.wordCount / 600) * 30), 30);

  // Formatting (20) — sections present
  const fmtScore = Math.min(parsed.hasSections * 5, 20);

  // Keywords (10)
  const kwScore = Math.min(parsed.skills.length, 10);

  const total = skillScore + expScore + fmtScore + kwScore;

  const suggestions = [];
  if (skillScore < 20) suggestions.push('Add more relevant technical skills');
  if (expScore < 15) suggestions.push('Expand your experience descriptions with measurable achievements');
  if (fmtScore < 10) suggestions.push('Add clear sections: Experience, Education, Skills, Projects');
  if (!parsed.email) suggestions.push('Include your email address');
  if (!parsed.phone) suggestions.push('Include your phone number');
  if (parsed.skills.length < 5) suggestions.push('List at least 8-10 technical skills');

  return {
    total, skillScore, expScore, fmtScore, kwScore,
    atsCompatible: total >= 60,
    keywordMatch: jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 0,
    suggestions,
    parsedData: parsed,
  };
}

exports.analyzeResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const text = await extractText(req.file.path, ext === 'pdf' ? 'pdf' : 'docx');
    const parsed = parseResume(text);
    const jobSkills = req.body.jobSkills ? JSON.parse(req.body.jobSkills) : [];
    const result = scoreResume(parsed, jobSkills);
    res.json({
      success: true,
      fileName: req.file.originalname,
      filePath: `/uploads/resumes/${req.file.filename}`,
      ...result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
