/*
 * Purpose: Calls the Banana API and prints the real reply, plus two failures.
 * Theme: Interoperability
 *
 * Run from the server folder: npm run test:banana
 * This script talks to the Banana API directly. The React app must not do that.
 * The solution is printed here on purpose, because this is a developer check,
 * not the public /api/puzzle route.
 */

const { BANANA_API_URL, BANANA_TIMEOUT_MS } = require('../config/banana');

const WRONG_URL = 'https://marcconrad.com/uob/banana/not-a-real-endpoint.php';

// Print status, headers, and body. Returns true only for a usable puzzle.
async function showResponse(label, url, timeoutMs) {
  console.log('');
  console.log('========== ' + label + ' ==========');
  console.log('Time:', new Date().toISOString());
  console.log('Request URL:', url);
  console.log('Timeout ms:', timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(timeoutMs)
    });

    console.log('Status:', response.status, response.statusText);
    console.log('Headers:');
    response.headers.forEach((value, key) => {
      console.log('  ' + key + ': ' + value);
    });

    const body = await response.text();
    console.log('Body:');
    console.log(body);

    if (!response.ok) {
      return false;
    }

    const data = JSON.parse(body);
    const solution = Number(data.solution);
    return typeof data.question === 'string' && Number.isInteger(solution);
  } catch (error) {
    console.log('Request failed');
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    return false;
  }
}

async function main() {
  console.log('Banana API evidence script');
  console.log('Documented base URL is http://marcconrad.com/uob/banana/api.php');
  console.log('That http address redirects (301) to https. This script uses https.');

  const success = await showResponse('SUCCESS: real Banana API', BANANA_API_URL, BANANA_TIMEOUT_MS);
  await showResponse('FAILURE: wrong URL', WRONG_URL, BANANA_TIMEOUT_MS);
  await showResponse('FAILURE: timeout (1 ms)', BANANA_API_URL, 1);

  if (!success) {
    console.error('The success call did not return a puzzle. Check your network.');
    process.exit(1);
  }
}

main();
