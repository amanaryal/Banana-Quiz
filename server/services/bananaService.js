/*
 * Purpose: Calls the external Banana API and turns the reply into a simple object.
 * Theme: Interoperability
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 *
 * The React app must not call this API. Only this server file does.
 */

const { BANANA_API_URL, BANANA_TIMEOUT_MS } = require('../config/banana');

// Build an error that the route can turn into an HTTP status code.
function apiError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Ask the Banana API for one puzzle. Throws if anything is wrong.
async function getBananaPuzzle() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BANANA_TIMEOUT_MS);

  try {
    // REQUEST: GET the puzzle URL. out=json asks for a JSON body.
    // WHAT CAN GO WRONG: no network, DNS failure, or the site is down.
    const response = await fetch(BANANA_API_URL, {
      method: 'GET',
      signal: controller.signal
    });

    // RESPONSE: read the status and the raw text.
    // The live API uses Content-Type text/html even when the body is JSON,
    // so we do not trust that header. We read the text and parse it ourselves.
    const rawBody = await response.text();

    if (!response.ok) {
      // A wrong URL comes back as 404 HTML. That is a bad gateway for our users.
      throw apiError('The Banana API returned an error status.', 502);
    }

    // DATA PROCESSING: the body should be JSON with "question" (image link) and "solution" (digit).
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
      throw apiError('The Banana API JSON did not include a puzzle image and a digit.', 502);
    }

    // The solution is returned only to our own route. That route stores it and
    // does not put it in the JSON sent to the browser.
    return {
      imageUrl,
      solution
    };
  } catch (error) {
    // WHAT CAN GO WRONG: AbortError or TimeoutError means we gave up because the call was too slow.
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      throw apiError('The Banana API took too long to answer.', 504);
    }

    if (error.statusCode) {
      throw error;
    }

    throw apiError('Could not reach the Banana API.', 502);
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  getBananaPuzzle
};
