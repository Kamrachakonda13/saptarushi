// lib/env.js — dependency-free .env loader.
//
// This project has no package manager (no package.json / node_modules), so we
// parse .env ourselves rather than depending on `dotenv`.
//
// Rules:
//   - Blank lines and lines starting with # are ignored.
//   - KEY=VALUE; the key must be a valid identifier.
//   - Values may be wrapped in matching single or double quotes. Inside double
//     quotes, \n becomes a newline and \" becomes a quote.
//   - Unquoted values are truncated at an inline ` #` comment.
//   - Real environment variables take precedence over .env, so exporting
//     ADMIN_PASS in the shell overrides the file.
//
// Usage:  require('./lib/env').loadEnv();

const fs = require('fs');
const path = require('path');

function parse(text) {
  const out = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eq = line.indexOf('=');
    if (eq < 1) continue;

    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

    let val = line.slice(eq + 1).trim();
    if (val.length >= 2 && val[0] === '"' && val[val.length - 1] === '"') {
      val = val.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"');
    } else if (val.length >= 2 && val[0] === "'" && val[val.length - 1] === "'") {
      val = val.slice(1, -1);
    } else {
      val = val.split(/\s+#/)[0].trim();
    }
    out[key] = val;
  }
  return out;
}

/**
 * Load .env into process.env without overwriting existing values.
 * Missing file is not an error — env vars may be set externally instead.
 */
function loadEnv(file) {
  const target = file || path.join(__dirname, '..', '.env');
  let text;
  try {
    text = fs.readFileSync(target, 'utf8');
  } catch (_) {
    return {};
  }
  const parsed = parse(text);
  for (const [k, v] of Object.entries(parsed)) {
    if (!(k in process.env)) process.env[k] = v;
  }
  return parsed;
}

module.exports = { loadEnv, parse };