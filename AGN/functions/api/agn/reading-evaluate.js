// AGN Reading Assessment — 2-Step Evaluation
// Step 1: Gemini transcribes audio + qualitative assessment
// Step 2: Server-side word comparison for accuracy, WPM, errors, level

export async function onRequestPost(context) {
  const { request, env } = context;
  const cors = corsHeaders();

  try {
    const { audio, mimeType, passageText, passageWordCount, durationSeconds, studentName } = await request.json();

    if (!audio || !passageText) {
      return new Response(JSON.stringify({ error: 'Missing required fields: audio and passageText' }), { status: 400, headers: cors });
    }

    // Get Gemini API key (KV override > env)
    const kvKey = await env.AGN_USERS.get('settings:gemini_key');
    const apiKey = kvKey || env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured. Ask your admin to set it.' }), { status: 500, headers: cors });
    }

    const passageWords = passageText.trim().split(/\s+/);
    const wordCount = passageWordCount || passageWords.length;
    const duration = durationSeconds || 60;

    // ═══════════════════════════════════════════
    // PASS 1: Blind transcription (no passage context)
    // Gemini writes EXACTLY what it hears — mispronunciations preserved
    // ═══════════════════════════════════════════
    const pass1Prompt = `You are listening to a kindergarten child (age 4-6) reading aloud.

Transcribe EXACTLY what the child says — write the words as they sound, not as they should be.
- If the child says "tink" instead of "think", write "tink"
- If the child says "meeesy" instead of "messy", write "meeesy"
- If the child says "aminal" instead of "animal", write "aminal"
- If the child says "pish" instead of "fish", write "pish"
- Do NOT correct or normalize any pronunciation — capture exactly how it sounds
- Remove stutters/repeats ("the the the cat" → "the cat") and fillers (um, uh, hmm)
- If the child self-corrects, keep only the final word

Also rate these (1-5 each, generous for age 4-6):
- fluency: reading flow (3+ if child keeps going despite pauses)
- confidence: voice volume/steadiness
- expression: intonation variety
- emotional_tone: nervous/hesitant/calm/confident/excited

Respond ONLY with JSON:
{
  "transcript": "<exact words as they sounded — no corrections>",
  "scores": { "fluency": <1-5>, "confidence": <1-5>, "expression": <1-5> },
  "emotional_tone": "<tone>",
  "hesitations": <count>, "repetitions": <count>, "self_corrections": <count>,
  "encouragement": "<warm message for child>",
  "teacherNote": "<professional note>"
}`;

    // Pass 1 = audio → transcription. Use Pro for best speech accuracy on KG voices,
    // fall back to 2.5-flash if the preview is unavailable.
    const pass1Models = ['gemini-3.1-pro-preview', 'gemini-2.5-flash'];
    const audioBody = JSON.stringify({
      contents: [{ parts: [
        { inlineData: { mimeType: mimeType || 'audio/webm', data: audio } },
        { text: pass1Prompt }
      ]}],
      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    let pass1Data = null;
    let modelUsed = '';

    for (const model of pass1Models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: audioBody });
        if (res.ok) { pass1Data = await res.json(); modelUsed = model; break; }
      } catch (e) {}
    }

    if (!pass1Data) {
      return new Response(JSON.stringify({ error: 'AI service unavailable', fallback: true }), { status: 502, headers: cors });
    }

    const pass1Finish = getFinishReason(pass1Data);
    let pass1Text = extractText(pass1Data);
    if (!pass1Text) {
      const detail = pass1Finish ? ` (finish: ${pass1Finish})` : '';
      return new Response(JSON.stringify({ error: 'Invalid AI response' + detail, fallback: true }), { status: 502, headers: cors });
    }

    let pass1Result;
    try {
      pass1Result = extractJSON(pass1Text);
    } catch (e) {
      pass1Result = parseWithRegex(pass1Text);
      if (!pass1Result) {
        const detail = pass1Finish === 'MAX_TOKENS' ? ' (response was truncated)' : '';
        return new Response(JSON.stringify({ error: 'Could not parse AI response (pass 1)' + detail, fallback: true, finishReason: pass1Finish, raw: pass1Text.substring(0, 300) }), { status: 502, headers: cors });
      }
    }

    const rawTranscript = (pass1Result.transcript || '').trim();

    // ═══════════════════════════════════════════
    // PASS 2: Text-only — compare raw transcript against passage
    // Identifies mispronunciations by diffing the two texts
    // ═══════════════════════════════════════════
    const pass2Prompt = `A kindergarten child was asked to read this passage:
"""
${passageText}
"""

The AI heard them say (raw transcription):
"""
${rawTranscript}
"""

Compare these two texts word by word. Identify ALL pronunciation differences. Do not rewrite the transcript — only return the analysis.

A "mispronunciation" means the child clearly attempted the SAME word but pronounced part of it differently (e.g., passage says "messy" but child said "meeesy", or passage says "thank" and child said "tank"). Words that sound similar but mean something different (e.g., passage says "thank" and child said "think") are SUBSTITUTIONS — do NOT include them in mispronounced.

Score: pronunciation (1-5): 0-1 mispronounced=5, 2-3=4, 4-5=3, 6-8=2, 9+=1

Respond ONLY with JSON:
{
  "mispronounced": [{"expected": "<passage word>", "said": "<how child said it>"}],
  "pronunciation": <1-5>
}`;

    // Pass 2 = text-only diff. Flash is plenty here; Pro is overkill for plain text.
    const pass2Models = ['gemini-3-flash-preview', 'gemini-2.5-flash'];
    let pass2Result = { mispronounced: [], pronunciation: 3 };
    try {
      const pass2Body = JSON.stringify({
        contents: [{ parts: [{ text: pass2Prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      for (const model of pass2Models) {
        const pass2Url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const pass2Res = await fetch(pass2Url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: pass2Body });
        if (pass2Res.ok) {
          const pass2Data = await pass2Res.json();
          let p2Text = extractText(pass2Data);
          if (p2Text) {
            try { pass2Result = extractJSON(p2Text); } catch (e) {}
          }
          break;
        }
      }
    } catch (e) {
      // Pass 2 failure is non-fatal — we still have the raw transcript
    }

    // Merge results from both passes — use the RAW transcript (what the child actually said) for display
    const geminiResult = {
      transcript: rawTranscript,
      mispronounced: pass2Result.mispronounced || [],
      scores: {
        pronunciation: pass2Result.pronunciation || 3,
        fluency: (pass1Result.scores || {}).fluency || 3,
        confidence: (pass1Result.scores || {}).confidence || 3,
        expression: (pass1Result.scores || {}).expression || 3
      },
      emotional_tone: pass1Result.emotional_tone || 'calm',
      hesitations: pass1Result.hesitations || 0,
      repetitions: pass1Result.repetitions || 0,
      self_corrections: pass1Result.self_corrections || 0,
      encouragement: pass1Result.encouragement || 'Great job reading!',
      teacherNote: pass1Result.teacherNote || ''
    };

    const transcript = geminiResult.transcript;
    const mispronounced = geminiResult.mispronounced || [];

    // ═══════════════════════════════════════════
    // STEP 2: Server-side word comparison
    // Comparison runs on RAW transcript; mispronunciations are surfaced as such, not silently corrected.
    // ═══════════════════════════════════════════
    const comparison = compareWords(passageText, transcript, mispronounced);

    // wordsCorrect = exact correct words (not mispronounced)
    // mispronunciations are tracked separately and visible to teachers
    const wordsCorrect = comparison.correct;
    const wordsPerMinute = duration > 0 ? Math.round(((wordsCorrect + comparison.mispronouncedCount) / duration) * 60) : 0;
    const errorCount = comparison.errors.length;

    // Determine overall level from admin-configured assessment scale (or defaults)
    const scaleRaw = await env.AGN_USERS.get('settings:assessment_scale');
    const scale = scaleRaw ? JSON.parse(scaleRaw) : null;
    // Empty-input guard: if nothing was read, force lowest level
    const overallLevel = (wordsCorrect + comparison.mispronouncedCount) === 0
      ? 1
      : calculateLevel(wordsPerMinute, errorCount, scale);

    // Compute accuracy score server-side — includes mispronunciations
    const accuracyPct = wordCount > 0 ? (wordsCorrect / wordCount) : 0;
    const accuracyScore = accuracyPct >= 0.95 ? 5 : accuracyPct >= 0.85 ? 4 : accuracyPct >= 0.70 ? 3 : accuracyPct >= 0.50 ? 2 : 1;

    // Clamp Gemini's qualitative scores
    const gScores = geminiResult.scores || {};
    const scores = {
      pronunciation: clamp(gScores.pronunciation || 3, 1, 5),
      fluency: clamp(gScores.fluency || 3, 1, 5),
      accuracy: accuracyScore, // Server-computed, not Gemini
      confidence: clamp(gScores.confidence || 3, 1, 5),
      expression: clamp(gScores.expression || 3, 1, 5)
    };

    return new Response(JSON.stringify({
      // Transcript from Gemini
      transcript,

      // Server-computed accuracy metrics
      wordsCorrect,
      wordsPerMinute,
      errorCount,
      errors: comparison.errors,
      wordByWord: comparison.wordByWord, // detailed per-word results

      // Gemini qualitative + server accuracy
      scores,
      overallLevel,

      // Gemini extras
      mispronounced: geminiResult.mispronounced || [],
      emotional_tone: geminiResult.emotional_tone || 'calm',
      hesitations: geminiResult.hesitations || 0,
      repetitions: geminiResult.repetitions || 0,
      self_corrections: geminiResult.self_corrections || 0,

      // Messages
      encouragement: geminiResult.encouragement || 'Great job reading!',
      teacherNote: geminiResult.teacherNote || '',

      // Meta
      ai: true,
      model: modelUsed,
      passageWordCount: wordCount,
      durationSeconds: duration
    }), { headers: cors });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error: ' + err.message, fallback: true }), { status: 500, headers: cors });
  }
}

// ── Word-by-word comparison ──
// Aligns the raw transcript against the passage. Words that the AI flagged as
// mispronunciations of a passage word are aligned to that passage word with
// status='mispronunciation' (visible, not silently corrected). Other close
// matches that are not in the mispronunciation list are treated as substitutions.
// Returns: { correct, mispronouncedCount, errors[], wordByWord[] }
function compareWords(passageText, transcript, mispronounced) {
  const normalize = (w) => w.toLowerCase().replace(/[^a-z']/g, '');
  const passageWords = passageText.trim().split(/\s+/).map(normalize).filter(Boolean);
  const spokenWords = transcript.trim().split(/\s+/).map(normalize).filter(Boolean);

  // Remove filler words from spoken (um, uh, hmm, etc.)
  const fillers = new Set(['um', 'uh', 'uhh', 'hmm', 'mmm', 'ah', 'ahh', 'er', 'erm']);
  const noFillers = spokenWords.filter(w => !fillers.has(w));

  // Remove consecutive duplicate words — KG children naturally stutter/repeat
  const cleanSpoken = [];
  for (let k = 0; k < noFillers.length; k++) {
    if (k === 0 || noFillers[k] !== noFillers[k - 1]) {
      cleanSpoken.push(noFillers[k]);
    }
  }

  // Build a lookup of AI-flagged mispronunciations: said-word -> expected-word
  const misMap = {};
  (mispronounced || []).forEach(function(m) {
    if (m && m.expected && m.said) {
      misMap[normalize(m.said)] = normalize(m.expected);
    }
  });

  // Levenshtein-based alignment (DP for word sequences)
  // Scoring: exact match=0, mispronunciation (AI-flagged)=0.5, anything else=1
  const m = passageWords.length;
  const n = cleanSpoken.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const exp = passageWords[i-1];
      const said = cleanSpoken[j-1];
      let subCost = 1;
      if (exp === said) subCost = 0;
      else if (misMap[said] === exp) subCost = 0.5; // AI-flagged mispronunciation: align but mark
      dp[i][j] = Math.min(
        dp[i-1][j-1] + subCost,
        dp[i-1][j] + 1,    // omission
        dp[i][j-1] + 1     // addition
      );
    }
  }

  // Backtrack
  const wordByWord = [];
  const errors = [];
  let i = m, j = n;
  let mispronouncedCount = 0;

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

  const correct = wordByWord.filter(w => w.status === 'correct').length;
  return { correct, mispronouncedCount, errors, wordByWord };
}

// ── Level calculation — uses admin-configured scale or defaults ──
// Scale format: { "1": { label, minWpm?, maxWpm?, minErrors?, maxErrors? }, ... }
// A level matches when wpm ∈ [minWpm, maxWpm] AND errorCount ∈ [minErrors, maxErrors].
// Iterates highest-first; first match wins.
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
  // No match — return lowest configured level (typically Needs Help)
  return levels.length ? Math.min(...levels) : 1;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// ── Extract text from Gemini response (handles thinking parts) ──
function extractText(geminiData) {
  try {
    const parts = geminiData.candidates[0].content.parts;
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i].text) return parts[i].text;
    }
  } catch (e) {}
  return null;
}

function getFinishReason(geminiData) {
  try { return geminiData.candidates[0].finishReason || null; } catch (e) { return null; }
}

// ── Robust JSON extraction from Gemini response text ──
// Handles markdown fences, extra text before/after JSON, etc.
function extractJSON(text) {
  // Strip markdown code fences
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  // Try direct parse first
  try { return JSON.parse(cleaned); } catch (e) {}

  // Find the first { and last } to extract the JSON object
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try { return JSON.parse(cleaned.substring(start, end + 1)); } catch (e) {}
  }

  throw new Error('No valid JSON found');
}

// ── Regex fallback parser ──
function parseWithRegex(text) {
  // Handle multiline transcripts — match up to the next key or closing brace
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

// ── CORS ──
function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
