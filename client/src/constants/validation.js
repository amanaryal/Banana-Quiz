/*
 * Purpose: Checks the register form with the same rules as the server.
 * Theme: Virtual identity
 *
 * These rules must match validateNewUser in server/controllers/authController.js.
 */

export function checkUsername(value) {
  const name = String(value || '').trim();

  if (!name) {
    return 'Enter a username. Example: Aman Aryal';
  }

  if (!/^[A-Za-z0-9_ ]{2,40}$/.test(name) || !/[A-Za-z0-9]/.test(name)) {
    return 'Use 2 to 40 letters, numbers, spaces, or underscores. Example: Aman Aryal';
  }

  return '';
}

export function checkEmail(value) {
  const email = String(value || '').trim();

  if (!email) {
    return 'Enter an email address.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'That email does not look complete.';
  }

  return '';
}

export function checkPassword(value) {
  const password = String(value || '');

  if (!password) {
    return 'Enter a password. A short one is allowed.';
  }

  if (password.length > 72) {
    return 'Use 72 characters or fewer.';
  }

  return '';
}
