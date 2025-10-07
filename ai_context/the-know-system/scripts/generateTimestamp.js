/**
 * Generate Timestamp Utilities
 * Returns current date and time for YAML execution plans.
 */

/**
 * Get current timestamp in YYYY-MM-DD HH:MM:SS format
 * @returns {string} Current timestamp
 */
function getCurrentTimestamp() {
  const now = new Date();
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Get timestamp for plan creation
 * @returns {string} Creation timestamp
 */
function getCreationTimestamp() {
  return getCurrentTimestamp();
}

/**
 * Get timestamp for last updated field
 * @returns {string} Last updated timestamp
 */
function getLastUpdatedTimestamp() {
  return getCurrentTimestamp();
}

// Always export for Node.js
module.exports = {
  getCurrentTimestamp,
  getCreationTimestamp,
  getLastUpdatedTimestamp
};

// For browser/React usage
if (typeof window !== 'undefined') {
  window.TimestampUtils = {
    getCurrentTimestamp,
    getCreationTimestamp,
    getLastUpdatedTimestamp
  };
}

// For command line usage - always run when called directly
console.log(getCurrentTimestamp());
