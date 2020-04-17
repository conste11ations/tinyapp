const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { existingEmailChecker, getUserByEmail, urlsForUser, generateRandomString } = require("./helpers");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['AES'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" },
  "55abc2": { longURL: "http://www.stackoverflow.com", userID: "user2RandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2b$10$3vf6wuMM1q8ay2.BXcwapuyyGYXodFfE0N8ftkwiip0qgpzmNQujW"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2b$10$GWYu..2/7SqTHOb4wty/QuHyqYNbDyI4/Gl0HcbmpxKTo.XzhzSkW"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "$2b$10$aPKr/5TRHr1IyUoA81QZh.b.HDHRHheluqgqM3iMOruRMOBQHU.YK"
  }
};

////////////////////////////// GET //////////////////////////////
app.get("/", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = { user: users[req.session.user_id], urls: urlDatabase };
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id], urls: urlDatabase };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.user_id], urls: urlDatabase };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

app.get("/urls", (req, res) => {
  if (users[req.session.user_id]) {
    let activeUser = users[req.session.user_id];
    let templateVars = { user: activeUser, urls: urlsForUser(activeUser.id, urlDatabase) };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
//  I know the instructions say to display an error message about the fact that you haven't logged in
// I thought it would be more efficient to actually direct the user to the log in page.
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//order matters! below must be defined before :shortURL otherwise
//Express will think 'new' is a route param
app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
// this is the GET /urls/:id method (at first the assignmend called it :shortURL)
// Sorry, i ddin't like the inconsistency of using /urls/:id in the instructions
app.get("/urls/:shortURL", (req, res) => {
  let activeUser = users[req.session.user_id];
  if (!activeUser) {
    res.status(404).send("Please log in!");
  } else if (!urlDatabase[req.params.shortURL]) {
    res.status(403).send("Invalid shortURL link");
  } else if (urlDatabase[req.params.shortURL].userID === activeUser.id) {
    let templateVars = {
      user: activeUser.id,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("this is not your URL");
  }
});
// this is the GET /u/:id method
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL for the given ID does not exist");
  }
});
////////////////////////// POST ////////////////////////////////

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("400 Either email or password empty");
  } else if (existingEmailChecker(req.body.email, users)) {
    res.status(400).send("400 Email already exists");
  } else {
    const uniqueUserID = Object.keys(users).length + generateRandomString(req.body.fullname);
    users[uniqueUserID] = {
      id: uniqueUserID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = uniqueUserID;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  if (existingEmailChecker(req.body.email, users)) {
    if (bcrypt.compareSync(req.body.password, getUserByEmail(req.body.email, users).password)) {
      req.session.user_id = getUserByEmail(req.body.email, users).id;
      res.redirect("/urls");
    } else {
      res.status(403).send("403 Password incorrect");
    }
  } else {
    res.status(403).send("403 User with that email not found");
  }
});

app.post("/logout", (req, res) => {
  req.session = null; //Notes: formerly res.clearCookie("session")
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let activeUser = users[req.session.user_id];
  if (activeUser) {
    const createdShortURL = generateRandomString(req.body.longURL);
    urlDatabase[createdShortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
    res.redirect("/urls/" + createdShortURL);
  } else {
    res.status(404).send("Please log in!");
  }
});

// Sorry, i ddin't like the inconsistency of using /urls/:id in the instructions
app.post("/urls/:shortURL", (req, res) => {
  let activeUser = users[req.session.user_id];
  if (!activeUser) {
    res.status(404).send("Please log in!");
  } else if (urlDatabase[req.params.shortURL].userID === activeUser.id) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect("/urls");
  } else {
    res.status(404).send("no URL for you!");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let activeUser = users[req.session.user_id];
  if (!activeUser) {
    res.status(404).send("Please log in!");
  } else if (urlDatabase[req.params.shortURL].userID === activeUser.id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(404).send("Unauthorized deletion!");
  }
});
/////////////////////////// END /////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

