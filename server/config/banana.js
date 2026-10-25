/*
 * Purpose: Holds the Banana API address and the time we are willing to wait.
 * Theme: Interoperability
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 *
 * The documentation page lists http://marcconrad.com/uob/banana/doc.php
 * and says the base URL is http://marcconrad.com/uob/banana/api.php.
 * Calling that http address returns 301 Moved Permanently to the https address.
 * This file uses https directly.
 *
 * Checked on 25 Oct 2026: a successful body looks like
 * { "question": "https://www.sanfoh.com/uob/banana/data/<file>.png", "solution": 3 }
 * The Content-Type header is text/html even though the body is JSON.
 */

const BANANA_API_URL =
  process.env.BANANA_API_URL || 'https://marcconrad.com/uob/banana/api.php?out=json';

const BANANA_TIMEOUT_MS = Number(process.env.BANANA_TIMEOUT_MS) || 8000;

module.exports = {
  BANANA_API_URL,
  BANANA_TIMEOUT_MS
};
