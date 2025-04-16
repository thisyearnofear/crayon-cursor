// env.js
// Utility to expose environment variables to the browser

/**
 * Initializes environment variables
 * We're now using a proxy server for Pinata API calls, so we don't need to expose the JWT
 */
export function setupEnvironment() {
  // Create a window.ENV object if it doesn't exist
  window.ENV = window.ENV || {};

  // Add any other environment variables here if needed in the future

  return window.ENV;
}
