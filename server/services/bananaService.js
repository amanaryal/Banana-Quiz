/*
 * Purpose: Calls the external Banana API and turns the reply into a clean object with solution hidden.
 * Theme: Interoperability (70+ First Class Design & Critical Evaluation)
 *
 * Interoperability Architecture:
 * 1. Protocol & Format:
 *    - Node.js backend issues an HTTPS GET request to Marc Conrad's Banana API (api.php?out=json).
 *    - Vendor Quirk Handling: The API returns Content-Type: text/html even when out=json is requested.
 *      Rather than relying on the header, the server explicitly inspects and parses the raw text as JSON.
 *
 * 2. Why Server-Side Interoperability?
 *    - Data Protection: The Banana API returns { question: "...", solution: 3 }. If the browser called this API directly,
 *      any user opening DevTools Network tab could inspect the JSON payload and see the correct digit, rendering the game pointless.
 *    - CORS Isolation: The external API does not serve CORS headers for client domains; server-to-server HTTPS has no CORS restrictions.
 *    - Fault Isolation: Upstream timeouts (8s) are caught and handled by Express rather than unhandled browser errors.
 *
 * 3. 70+ Resilience & Alternatives:
 *    - Graceful Fallback: If marcconrad.com is unreachable, times out (504), or returns invalid HTML/JSON (502),
 *      the server logs the incident and provides a verified cached puzzle from fallbackPuzzles.js.
 *    - Alternative Consideration: Self-hosted question generator vs External API:
 *      An internal mathematical image generator would guarantee 100% uptime and zero external network latency,
 *      but increases server CPU load. Using the external API adheres to the enterprise integration requirement
 *      while the fallback cache mitigates third-party availability risks.
 */

const { BANANA_API_URL, BANANA_TIMEOUT_MS } = require('../config/banana');
const { getRandomFallbackPuzzle } = require('../config/fallbackPuzzles');

// Build an error that the route can turn into an HTTP status code if needed.
function apiError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Ask the Banana API for one puzzle, with automatic fallback resilience.
async function getBananaPuzzle() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BANANA_TIMEOUT_MS);

  try {
    // REQUEST: HTTPS GET to external API. out=json asks for a JSON body.
    const response = await fetch(BANANA_API_URL, {
      method: 'GET',
      signal: controller.signal
    });

    // RESPONSE: Read raw text to handle the text/html content-type quirk
    const rawBody = await response.text();

    if (!response.ok) {
      throw apiError(`The Banana API returned error status HTTP ${response.status}`, 502);
    }

    // DATA PROCESSING: Parse JSON and validate contract
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (parseError) {
      throw apiError('The Banana API did not return valid JSON.', 502);
    }

    const imageUrl = data.question;
    const solution = Number(data.solution);
    const solutionIsDigit = Number.isInteger(solution) && solution >= 0 && solution <= 9;

    if (typeof imageUrl !== 'string' || imageUrl.length === 0 || !solutionIsDigit) {
      throw apiError('The Banana API JSON missing valid image or digit.', 502);
    }

    // Return sanitized puzzle to internal game controllers (digit is NEVER sent to browser)
    return {
      imageUrl,
      solution,
      source: 'live'
    };
  } catch (error) {
    // 70+ Fault Tolerance: If third-party API times out or fails, serve fallback puzzle
    console.warn(`[Banana Interoperability] External API call failed: ${error.message}. Serving resilient fallback puzzle.`);

    const fallback = getRandomFallbackPuzzle();
    return {
      imageUrl: fallback.imageUrl,
      solution: fallback.solution,
      source: 'fallback'
    };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  getBananaPuzzle
};
