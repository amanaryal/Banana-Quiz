/*
 * Purpose: Calls the Express server. This file never calls the Banana API.
 * Theme: Interoperability and virtual identity
 *
 * credentials: 'include' tells the browser to send the httpOnly login cookie.
 * The server CORS settings must allow this origin and credentials.
 */

const API_URL = 'http://localhost:5000';

// path example: '/api/puzzle'. options: { method, body }.
export async function api(path, options = {}) {
  const headers = {};

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(API_URL + path, {
      method: options.method || 'GET',
      credentials: 'include',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      data = { success: false, message: 'The server sent a response that was not JSON.' };
    }

    return {
      ok: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: {
        success: false,
        message: 'Cannot reach the server. Start it with npm run dev in the server folder.'
      }
    };
  }
}
