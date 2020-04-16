function existingEmailChecker(email, database) {
  for (let [key, value] of Object.entries(database)) {
    if (email === value.email) return true;
  }
  return false;
}

// this is the getUserByEmail function
function userRetriever(email, database) {
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

module.exports = {
  existingEmailChecker,
  userRetriever,
  urlsForUser
};