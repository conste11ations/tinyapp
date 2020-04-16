const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" },
  "55abc2": { longURL: "http://www.stackoverflow.com", userID: "user2RandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purp"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dish"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "soap"
  }
};

////////////////////////////// GET //////////////////////////////
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("register", templateVars);
});

app.get("/urls", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    let activeUser = users[req.cookies["user_id"]];
    let templateVars = { user: activeUser, urls: urlsForUser(activeUser.id) };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//order matters! below must be defined before :shortURL otherwise
//Express will think 'new' is a route param
app.get("/urls/new", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    let templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let activeUser = users[req.cookies["user_id"]];
  if (!activeUser) {
    res.send("Please log in!");
  } else if (urlDatabase[req.params.shortURL].userID === activeUser.id) {
  let templateVars = { 
    user: activeUser, 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL 
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
  } else {
    res.send("this is not your URL");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL);
  res.redirect(longURL);
});
////////////////////////// POST ////////////////////////////////

app.post("/register", (req, res) => {
  console.log(req.body);
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("400 Either email or password empty");
  } else if (existingEmailChecker(req.body.email)) {
    res.status(400).send("400 Email already exists");
  } else {
    const uniqueUserID = Object.keys(users).length + generateRandomString(req.body.fullname);
    users[uniqueUserID] = {
      id: uniqueUserID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", uniqueUserID);
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  console.log(req.body);
  console.log(userRetriever(req.body.email));
  if (existingEmailChecker(req.body.email)) {
    if (userRetriever(req.body.email).password === req.body.password) { // compare passwords
      res.cookie("user_id", userRetriever(req.body.email).id);
      res.redirect("/urls");
    } else {
      res.status(403).send("403 Password incorrect");
    }
  } else {
    res.status(403).send("403 User with that email not found");
  }
});

app.post("/logout", (req, res) => {
  console.log("logout!");
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log("body", req.body);  // Log the POST request body to the console
  // shortURL-longURL key-value pair are saved to the urlDatabase
  // responds with a redirection to /urls/:shortURL created
  if (users[req.cookies["user_id"]]) {
    const createdShortURL = generateRandomString(req.body.longURL);
    urlDatabase[createdShortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
    console.log(urlDatabase);
    res.redirect("/urls/" + createdShortURL);
  } else {

  }
});

// Sorry, i ddin't like the inconsistency of using /urls/:id in the instructions
app.post("/urls/:shortURL", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
    console.log(urlDatabase);
    res.redirect("/urls");
  } else {
    console.log("Please log in!");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let activeUser = users[req.cookies["user_id"]];
  if (activeUser && (urlDatabase[req.params.shortURL].userID === activeUser.id)) {
    delete urlDatabase[req.params.shortURL];
    console.log(urlDatabase);
    res.redirect("/urls");
  } else {
    res.send("Unauthorized!");
  }
});

/////////////////////////// END /////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// functions
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

function existingEmailChecker(email) {
  for (let [key, value] of Object.entries(users)) {
    if (email === value.email) return true;
  }
  return false;
}

function userRetriever(email) {
  for (let [key, value] of Object.entries(users)) {
    if (email === value.email) return value;
  }
  return false;
}

function urlsForUser(id) {
  let filteredURLs = {};
  for (let shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      filteredURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredURLs;
}