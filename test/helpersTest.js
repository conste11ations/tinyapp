const { assert, expect, should } = require('chai');
should();

const { existingEmailChecker, getUserByEmail, urlsForUser, generateRandomString } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  "a123": { longURL: "http://www.lighthouselabs.ca", userID: "test1" },
  "b246": { longURL: "http://www.google.com", userID: "test2" },
  "c369": { longURL: "http://www.stackoverflow.com", userID: "test1" }
};

describe('#getUserByEmail', function () {
  it('should return the right user given a valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    expect(user).to.deep.equal(testUsers["userRandomID"]);
    //    expect(user).to.have.property('email').equal("user@example.com");
  });
  it('should return a user object', () => {
    const user = getUserByEmail("user@example.com", testUsers)
    assert.typeOf(user, 'object');
  });
});

describe('#urlsForUser', function () {
  it('should return the right url object(s) given a user id', function () {

    const urls = urlsForUser("test1", testUrlDatabase)
    expect(urls).to.have.property('a123');
    urls.should.have.property('c369');

  });
})
