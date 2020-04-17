// Is someone trying to register with an email that exists in our database?
const existingEmailChecker = (email, database) => {

  for (let [key, value] of Object.entries(database)) {
    if (email === value.email) return true;
  }
  return false;
}

// this is the getUserByEmail function
const getUserByEmail = (email, database) => {

  for (let [key, value] of Object.entries(database)) {
    if (email === value.email) return value;
  }
  return false;
}
// returns a curated list of urls that the user owns and no more
const urlsForUser = (id, database) => {

  let filteredURLs = {};
  for (let shortURL in database) {
    if (id === database[shortURL].userID) {
      filteredURLs[shortURL] = database[shortURL];
    }
  }
  return filteredURLs;
}

const generateRandomString = (input) => {

  const crypto = require('crypto'),
    // Returns the names of supported hash algorithms
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