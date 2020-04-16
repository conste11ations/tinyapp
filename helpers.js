function existingEmailChecker(email, database) {
  for (let [key, value] of Object.entries(database)) {
    if (email === value.email) return true;
  }
  return false;
}

// this is the getUserByEmail function
function getUserByEmail(email, database) {
  for (let [key, value] of Object.entries(database)) {
    if (email === value.email) return value;
  }
  return false;
}

function urlsForUser(id, database) {
  let filteredURLs = {};
  for (let shortURL in database) {
    if (id === database[shortURL].userID) {
      filteredURLs[shortURL] = database[shortURL];
    }
  };
  return filteredURLs;
}

function generateRandomString(input) {
  // Importing 'crypto' module
  const crypto = require('crypto'),

    // Returns the names of supported hash algorithms
    // such as SHA1,MD5
    hash = crypto.getHashes();

  // 'digest' is the output of hash function containing
  // only hexadecimal digits
  hashPwd = crypto.createHash('SHA1').update(input).digest('hex');
  // truncate to only 6 alphanumeric string per instructions
  return hashPwd.slice(0, 6);
}

module.exports = {
  existingEmailChecker,
  getUserByEmail,
  urlsForUser, 
  generateRandomString
};