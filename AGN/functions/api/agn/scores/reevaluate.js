// Re-evaluate a student's reading using saved audio
// POST { studentName, scoreIndex } — admin/teacher only
// Fetches the audio from KV, runs it through the Gemini pipeline, updates the score record

export async function onRequestPost(context) {
  const { request, env } = context;
  const cors = corsHeaders();

  const auth = await authenticate(request, env);
  if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: 401, headers: cors });
  if (auth.user.role !== 'admin' && auth.user.role !== 'teacher') {
    return new Response(JSON.stringify({ error: 'Admin or teacher access required' }), { status: 403, headers: cors });
  }

  try {
    const { studentName, scoreIndex } = await request.json();
    if (!studentName || scoreIndex === undefined) {
      return new Response(JSON.stringify({ error: 'Missing studentName or scoreIndex' }), { status: 400, headers: cors });
    }

    const studentKey = 'student:' + studentName.toLowerCase().trim();

    // Load score history
    const historyRaw = await env.AGN_SCORES.get(studentKey);
    if (!historyRaw) return new Response(JSON.stringify({ error: 'No score history found' }), { status: 404, headers: cors });
    const history = JSON.parse(historyRaw);

    const idx = parseInt(scoreIndex);
    if (idx < 0 || idx >= history.length) {
      return new Response(JSON.stringify({ error: 'Invalid score index' }), { status: 400, headers: cors });
    }

    const record = history[idx];
    if (!record.audioKey) {
      return new Response(JSON.stringify({ error: 'No audio saved for this reading' }), { status: 404, headers: cors });
    }

    // Fetch audio from KV
    const audioRaw = await env.AGN_SCORES.get(record.audioKey);
    if (!audioRaw) {
      return new Response(JSON.stringify({ error: 'Audio expired or not found' }), { status: 404, headers: cors });
    }
    const { data: audioData, mime: audioMime } = JSON.parse(audioRaw);

    // Get passage text
    const passageText = await getPassageText(env, record.passageId, record.passageTitle);
    if (!passageText) {
      return new Response(JSON.stringify({ error: 'Passage text not found for passage ' + record.passageId }), { status: 404, headers: cors });
    }

    // Get Gemini API key
    const kvKey = await env.AGN_USERS.get('settings:gemini_key');
    const apiKey = kvKey || env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), { status: 500, headers: cors });
    }

    const passageWords = passageText.trim().split(/\s+/);
    const wordCount = record.passageWordCount || passageWords.length;

    // ═══════════════════════════════════════════
    // Single-pass Gemini: transcribe + detect mispronunciations + score
    // (Single call to avoid timeout on Cloudflare Workers)
    // ═══════════════════════════════════════════
    const prompt = `You are listening to a kindergarten child (age 4-6) reading aloud in English.

THE PASSAGE THEY ARE READING:
"""
${passageText}
"""

Transcribe EXACTLY what the child says — write the words as they sound, not as they should be.
- If the child says "tink" instead of "think", write "tink"
- If the child says "meeesy" instead of "messy", write "meeesy"
- Do NOT correct or normalize any pronunciation — capture exactly how it sounds, including accent variations
- Remove stutters/repeats ("the the the cat" → "the cat") and fillers (um, uh, hmm)
- If the child self-corrects, keep only the final word

Do ALL of the following in ONE response:
1. Transcribe exactly what the child said (no normalization, no correction)
2. List ALL mispronounced words — where the child's pronunciation differs from the passage word in any way. Do not ignore accent patterns; flag every difference.
3. Rate qualitative scores (generous for age 4-6)

Respond ONLY with JSON:
{
  "transcript": "<exact words as they sounded — no corrections>",
  "mispronounced": [{"expected": "<passage word>", "said": "<how child said it>"}],
  "scores": { "pronunciation": <1-5>, "fluency": <1-5>, "confidence": <1-5>, "expression": <1-5> },
  "emotional_tone": "<nervous|hesitant|calm|confident|excited>",
  "hesitations": <count>, "repetitions": <count>, "self_corrections": <count>,
  "encouragement": "<warm message for child>",
  "teacherNote": "<professional note>"
}`;

    // Single-pass audio re-evaluation — use Pro for accuracy, 2.5-flash fallback.
    const models = ['gemini-3.1-pro-preview', 'gemini-2.5-flash'];
    const reqBody = JSON.stringify({
      contents: [{ parts: [
        { inlineData: { mimeType: audioMime || 'audio/webm', data: audioData } },
        { text: prompt }
      ]}],
      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    let geminiData = null, modelUsed = '';
    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: reqBody });
        if (res.ok) { geminiData = await res.json(); modelUsed = model; break; }
      } catch (e) {}
    }

    if (!geminiData) {
      return new Response(JSON.stringify({ error: 'Gemini API unavailable' }), { status: 502, headers: cors });
    }

    const finishReason = getFinishReason(geminiData);
    let resultText = extractText(geminiData);
    if (!resultText) {
      const detail = finishReason ? ` (finish: ${finishReason})` : '';
      return new Response(JSON.stringify({ error: 'Invalid Gemini response' + detail, finishReason }), { status: 502, headers: cors });
    }

    let geminiResult;
    try {
      geminiResult = extractJSON(resultText);
    } catch (e) {
      geminiResult = parseWithRegex(resultText);
      if (!geminiResult) {
        const detail = finishReason === 'MAX_TOKENS' ? ' (response was truncated)' : '';
        return new Response(JSON.stringify({ error: 'Could not parse Gemini response' + detail, finishReason, raw: resultText.substring(0, 300) }), { status: 502, headers: cors });
      }
    }

    // ═══════════════════════════════════════════
    // Server-side word comparison
    // Uses RAW transcript so misreads remain visible; mispronunciations are
    // aligned to passage words and shown with status='mispronunciation'.
    // ═══════════════════════════════════════════
    const transcript = (geminiResult.transcript || '').trim();
    const mispronounced = geminiResult.mispronounced || [];
    const comparison = compareWords(passageText, transcript, mispronounced);

    const wordsCorrect = comparison.correct;
    const duration = record.durationSeconds || 1;
    const wordsPerMinute = duration > 0 ? Math.round(((wordsCorrect + comparison.mispronouncedCount) / duration) * 60) : 0;
    const errorCount = comparison.errors.length;

    const scaleRaw = await env.AGN_USERS.get('settings:assessment_scale');
    const scale = scaleRaw ? JSON.parse(scaleRaw) : null;
    const overallLevel = (wordsCorrect + comparison.mispronouncedCount) === 0
      ? 1
      : calculateLevel(wordsPerMinute, errorCount, scale);

    const accuracyPct = wordCount > 0 ? (wordsCorrect / wordCount) : 0;
    const accuracyScore = accuracyPct >= 0.95 ? 5 : accuracyPct >= 0.85 ? 4 : accuracyPct >= 0.70 ? 3 : accuracyPct >= 0.50 ? 2 : 1;

    const gScores = geminiResult.scores || {};
    const scores = {
      pronunciation: Math.max(1, Math.min(5, gScores.pronunciation || 3)),
      fluency: Math.max(1, Math.min(5, gScores.fluency || 3)),
      accuracy: accuracyScore,
      confidence: Math.max(1, Math.min(5, gScores.confidence || 3)),
      expression: Math.max(1, Math.min(5, gScores.expression || 3))
    };

    // Update the score record
    record.transcript = transcript;
    record.wordByWord = comparison.wordByWord;
    record.mispronounced = mispronounced;
    record.wordsCorrect = wordsCorrect;
    record.wpm = wordsPerMinute;
    record.errorCount = errorCount;
    record.scores = scores;
    record.level = overallLevel;
    record.emotional_tone = geminiResult.emotional_tone || 'calm';
    record.encouragement = geminiResult.encouragement || '';
    record.teacherNote = geminiResult.teacherNote || '';
    record.reEvaluated = new Date().toISOString();
    record.model = modelUsed;

    // Save updated history
    await env.AGN_SCORES.put(studentKey, JSON.stringify(history));

    return new Response(JSON.stringify({
      success: true,
      record,
      message: 'Re-evaluation complete'
    }), { headers: cors });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error: ' + err.message }), { status: 500, headers: cors });
  }
}

// ── Get passage text by ID ──
async function getPassageText(env, passageId, passageTitle) {
  // Try all class passage lists to find the passage
  const classesRaw = await env.AGN_USERS.get('settings:classes');
  const classes = classesRaw ? JSON.parse(classesRaw) : [];

  for (const cls of classes) {
    const raw = await env.AGN_USERS.get('passages:' + cls);
    if (!raw) continue;
    const passages = JSON.parse(raw);
    const found = passages.find(p => p.id === passageId || p.title === passageTitle);
    if (found && found.text) return found.text;
  }
  return null;
}

// ── Word comparison (same logic as reading-evaluate.js) ──
function compareWords(passageText, transcript, mispronounced) {
  const normalize = (w) => w.toLowerCase().replace(/[^a-z']/g, '');
  const passageWords = passageText.trim().split(/\s+/).map(normalize).filter(Boolean);
  const spokenWords = transcript.trim().split(/\s+/).map(normalize).filter(Boolean);
  const fillers = new Set(['um', 'uh', 'uhh', 'hmm', 'mmm', 'ah', 'ahh', 'er', 'erm']);
  const noFillers = spokenWords.filter(w => !fillers.has(w));
  const cleanSpoken = [];
  for (let k = 0; k < noFillers.length; k++) {
    if (k === 0 || noFillers[k] !== noFillers[k - 1]) cleanSpoken.push(noFillers[k]);
  }

  const misMap = {};
  (mispronounced || []).forEach(function(m) {
    if (m && m.expected && m.said) misMap[normalize(m.said)] = normalize(m.expected);
  });

  const m = passageWords.length, n = cleanSpoken.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const exp = passageWords[i-1];
      const said = cleanSpoken[j-1];
      let subCost = 1;
      if (exp === said) subCost = 0;
      else if (misMap[said] === exp) subCost = 0.5;
      dp[i][j] = Math.min(dp[i-1][j-1] + subCost, dp[i-1][j] + 1, dp[i][j-1] + 1);
    }
  }

  const wordByWord = [], errors = [];
  let i = m, j = n, mispronouncedCount = 0;
  while (i > 0 || j > 0) {
    const exp = i > 0 ? passageWords[i-1] : null;
    const said = j > 0 ? cleanSpoken[j-1] : null;
    if (i > 0 && j > 0 && exp === said && Math.abs(dp[i][j] - dp[i-1][j-1]) < 0.01) {
      wordByWord.unshift({ expected: exp, said, status: 'correct' });
      i--; j--;
    } else if (i > 0 && j > 0 && misMap[said] === exp && Math.abs(dp[i][j] - (dp[i-1][j-1] + 0.5)) < 0.01) {
      wordByWord.unshift({ expected: exp, said, status: 'mispronunciation' });
      errors.push({ word: exp, said, type: 'mispronunciation' });
      mispronouncedCount++;
      i--; j--;
    } else if (i > 0 && j > 0 && Math.abs(dp[i][j] - (dp[i-1][j-1] + 1)) < 0.01) {
      wordByWord.unshift({ expected: exp, said, status: 'substitution' });
      errors.push({ word: exp, said, type: 'substitution' });
      i--; j--;
    } else if (i > 0 && (j === 0 || Math.abs(dp[i][j] - (dp[i-1][j] + 1)) < 0.01)) {
      wordByWord.unshift({ expected: exp, said: '', status: 'omission' });
      errors.push({ word: exp, said: 'SKIPPED', type: 'omission' });
      i--;
    } else {
      wordByWord.unshift({ expected: '', said, status: 'addition' });
      errors.push({ word: '', said, type: 'addition' });
      j--;
    }
  }
  return { correct: wordByWord.filter(w => w.status === 'correct').length, mispronouncedCount, errors, wordByWord };
}

function calculateLevel(wpm, errorCount, scale) {
  const defaults = {
    1: { minWpm: 0,  maxWpm: 10,  minErrors: 5, maxErrors: 999 },
    2: { minWpm: 10, maxWpm: 20,                maxErrors: 5 },
    3: { minWpm: 20,                            maxErrors: 5 },
    4: { minWpm: 40,                            maxErrors: 0 }
  };
  const s = scale || defaults;
  const levels = Object.keys(s).map(Number).sort((a, b) => b - a);
  for (const lv of levels) {
    const r = s[lv];
    const minWpm = r.minWpm !== undefined ? r.minWpm : 0;
    const maxWpm = r.maxWpm !== undefined ? r.maxWpm : Infinity;
    const minErrors = r.minErrors !== undefined ? r.minErrors : 0;
    const maxErrors = r.maxErrors !== undefined ? r.maxErrors : 999;
    if (wpm >= minWpm && wpm <= maxWpm && errorCount >= minErrors && errorCount <= maxErrors) return lv;
  }
  return levels.length ? Math.min(...levels) : 1;
}

function extractText(geminiData) {
  try {
    const parts = geminiData.candidates[0].content.parts;
    for (let i = parts.length - 1; i >= 0; i--) { if (parts[i].text) return parts[i].text; }
  } catch (e) {}
  return null;
}

function getFinishReason(geminiData) {
  try { return geminiData.candidates[0].finishReason || null; } catch (e) { return null; }
}

function extractJSON(text) {
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(cleaned); } catch (e) {}
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try { return JSON.parse(cleaned.substring(start, end + 1)); } catch (e) {}
  }
  throw new Error('No valid JSON found');
}

function parseWithRegex(text) {
  const transcriptMatch = text.match(/"transcript"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const pronMatch = text.match(/"pronunciation"\s*:\s*(\d+)/);
  const fluencyMatch = text.match(/"fluency"\s*:\s*(\d+)/);
  const confidenceMatch = text.match(/"confidence"\s*:\s*(\d+)/);
  const expressionMatch = text.match(/"expression"\s*:\s*(\d+)/);
  const encouragementMatch = text.match(/"encouragement"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const teacherNoteMatch = text.match(/"teacherNote"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const toneMatch = text.match(/"emotional_tone"\s*:\s*"((?:[^"\\]|\\.)*)"/);

  if (!transcriptMatch) return null;

  return {
    transcript: transcriptMatch[1],
    mispronounced: [],
    scores: {
      pronunciation: pronMatch ? parseInt(pronMatch[1]) : 3,
      fluency: fluencyMatch ? parseInt(fluencyMatch[1]) : 3,
      confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 3,
      expression: expressionMatch ? parseInt(expressionMatch[1]) : 3
    },
    emotional_tone: toneMatch ? toneMatch[1] : 'calm',
    hesitations: 0,
    repetitions: 0,
    self_corrections: 0,
    encouragement: encouragementMatch ? encouragementMatch[1] : 'Great job reading!',
    teacherNote: teacherNoteMatch ? teacherNoteMatch[1] : ''
  };
}

async function authenticate(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return { ok: false, error: 'Not authenticated' };
  const userKey = await env.AGN_USERS.get('token:' + token);
  if (!userKey) return { ok: false, error: 'Invalid token' };
  const userData = await env.AGN_USERS.get(userKey);
  if (!userData) return { ok: false, error: 'User not found' };
  return { ok: true, user: JSON.parse(userData), userKey };
}

function corsHeaders() {
  return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
