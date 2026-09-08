import fs from 'fs';
import path from 'path';
import os from 'os';
import zlib from 'zlib';
import { execSync } from 'child_process';

/**
 * Multi-layer robust PDF text extractor:
 * Tier 1: pdf-parse on disk-persisted buffer (handles normal PDFs)
 * Tier 2: Built-in Node zlib stream decompression (handles corrupt xref/stream offsets)
 * Tier 3: Python3 stream parser (built-in standard library, handles complex FlateDecode)
 * Tier 4: Direct ASCII/UTF-8 string scanning for raw text objects
 */
export async function extractTextFromPdf(buffer: Buffer, originalFilename: string = 'resume.pdf'): Promise<string> {
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `careerx_resume_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`);

  try {
    fs.writeFileSync(tempFilePath, buffer);

    // --- TIER 1: pdf-parse ---
    try {
      let pdfParse: any;
      try {
        const imported = await import('pdf-parse');
        pdfParse = typeof imported === 'function' ? imported : (imported.default || imported);
        if (typeof pdfParse !== 'function' && pdfParse?.default) {
          pdfParse = pdfParse.default;
        }
      } catch {
        pdfParse = require('pdf-parse');
      }

      const fileBuffer = fs.readFileSync(tempFilePath);
      const pdfData = await pdfParse(fileBuffer);
      const text = pdfData?.text ? pdfData.text.trim() : '';
      if (text.length >= 20) {
        console.log(`[PDF Extraction] Tier 1 (pdf-parse) succeeded: ${text.length} chars`);
        return cleanExtractedText(text);
      }
    } catch (tier1Err: any) {
      console.warn('[PDF Extraction] Tier 1 failed, trying Tier 2:', tier1Err?.message || tier1Err);
    }

    // --- TIER 2: Node.js zlib stream decompression ---
    try {
      const tier2Text = extractViaZlibStreams(buffer);
      if (tier2Text.length >= 20) {
        console.log(`[PDF Extraction] Tier 2 (Node zlib) succeeded: ${tier2Text.length} chars`);
        return cleanExtractedText(tier2Text);
      }
    } catch (tier2Err: any) {
      console.warn('[PDF Extraction] Tier 2 failed, trying Tier 3:', tier2Err?.message || tier2Err);
    }

    // --- TIER 3: Python3 built-in stream extractor ---
    try {
      const pyScript = `
import zlib, re, sys

def extract(pdf_path):
    with open(pdf_path, 'rb') as f:
        content = f.read()
    streams = re.findall(rb'stream\\r?\\n([\\s\\S]*?)\\r?\\nendstream', content)
    full_text = []
    for s in streams:
        decompressed = ''
        try:
            decompressed = zlib.decompress(s).decode('utf-8', errors='ignore')
        except:
            try:
                decompressed = zlib.decompress(s, -15).decode('utf-8', errors='ignore')
            except:
                decompressed = s.decode('utf-8', errors='ignore')
        # Extract text in parentheses (Tj or inside TJ arrays)
        pieces = re.findall(r'\\(([^)]+)\\)', decompressed)
        full_text.extend(pieces)
    return ' '.join(full_text)

try:
    print(extract(sys.argv[1]))
except Exception as e:
    pass
`;
      const tier3Result = execSync(`python3 -c "${pyScript.replace(/"/g, '\\"')}" "${tempFilePath}"`, {
        timeout: 4000,
        encoding: 'utf-8',
      }).trim();

      if (tier3Result.length >= 20) {
        console.log(`[PDF Extraction] Tier 3 (Python3 zlib) succeeded: ${tier3Result.length} chars`);
        return cleanExtractedText(tier3Result);
      }
    } catch (tier3Err: any) {
      console.warn('[PDF Extraction] Tier 3 failed, trying Tier 4:', tier3Err?.message || tier3Err);
    }

    // --- TIER 4: Raw text extraction (uncompressed PDF or plain text segments) ---
    try {
      const rawString = buffer.toString('utf-8');
      const tjMatches = rawString.match(/\(([^()]{3,})\)\s*(?:Tj|'|")/g);
      if (tjMatches && tjMatches.length > 0) {
        const directText = tjMatches.map(m => m.replace(/[()]/g, '').replace(/\s*(?:Tj|'|")$/, '')).join(' ');
        if (directText.length >= 20) {
          console.log(`[PDF Extraction] Tier 4 (raw operators) succeeded: ${directText.length} chars`);
          return cleanExtractedText(directText);
        }
      }
    } catch {}

    return '';
  } finally {
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch {}
  }
}

/**
 * Decompress all FlateDecode streams using Node.js zlib and extract text operators
 */
function extractViaZlibStreams(buffer: Buffer): string {
  const content = buffer.toString('binary');
  const objRegex = /<<[\s\S]*?>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let text = '';
  let m;

  while ((m = objRegex.exec(content)) !== null) {
    const header = m[0].split('stream')[0];
    const rawStream = Buffer.from(m[1], 'binary');
    let decompressed = '';

    if (header.includes('FlateDecode')) {
      try {
        decompressed = zlib.inflateSync(rawStream).toString('utf-8');
      } catch {
        try {
          decompressed = zlib.inflateRawSync(rawStream).toString('utf-8');
        } catch {}
      }
    } else {
      decompressed = rawStream.toString('utf-8');
    }

    if (decompressed) {
      // Find (text) Tj
      const tjMatches = decompressed.match(/\(([^()]+)\)\s*Tj/g);
      if (tjMatches) {
        for (const t of tjMatches) {
          const inner = t.replace(/^\(/, '').replace(/\)\s*Tj$/, '');
          text += inner + ' ';
        }
      }

      // Find [(text) -10 (more)] TJ
      const arrayMatches = decompressed.match(/\[(.*?)\]\s*TJ/g);
      if (arrayMatches) {
        for (const arr of arrayMatches) {
          const innerStrings = arr.match(/\(([^()]*)\)/g);
          if (innerStrings) {
            for (const s of innerStrings) {
              text += s.slice(1, -1);
            }
            text += ' ';
          }
        }
      }
    }
  }

  return text.trim();
}

/**
 * Clean up extracted text: remove octal escapes, normalize spacing and line breaks
 */
function cleanExtractedText(text: string): string {
  return text
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\([nrtbf()\\\/])/g, (_, char) => {
      switch (char) {
        case 'n': return '\n';
        case 'r': return '\r';
        case 't': return '\t';
        case 'b': return '\b';
        case 'f': return '\f';
        default: return char;
      }
    })
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}
