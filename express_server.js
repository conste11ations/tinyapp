const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
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

////////////////////////////// GET //////////////////////////////
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("register", templateVars);
});

app.get("/urls", (req, res) => {
 // let users1 = users[req.cookies["user_id"]];
  let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  console.log(req.cookies);
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//order matters! below must be defined before :shortURL otherwise 
//Express will think 'new' is a route param
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
////////////////////////// POST ////////////////////////////////

app.post("/register", (req, res) => {
  console.log(req.body);
   const createdID = generateRandomString(req.body.fullname);
   console.log(createdID);
   const uniqueUserID = Object.keys(users).length + createdID;
   users[uniqueUserID] = {
     id: uniqueUserID,
     email: req.body.email,
     password: req.body.password
   };
   res.cookie("user_id", uniqueUserID);

  console.log(uniqueUserID);
//  console.log(req.body.fullname);
console.log(users);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
//  console.log(req.body);
  console.log(users[req.body.user_id]);
  if (users[req.body.user_id]) {
    res.cookie("user_id", req.body.user_id);
    res.redirect("/urls");
  } else {
    res.redirect("/register");
  }
});

app.post("/logout", (req, res) => {
  console.log("logout!");
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  // shortURL-longURL key-value pair are saved to the urlDatabase
  // responds with a redirection to /urls/:shortURL created
  const createdShortURL = generateRandomString(req.body.longURL);
  urlDatabase[createdShortURL] = req.body.longURL;
  res.redirect("/urls/" + createdShortURL);
});

// Sorry, i ddin't like the inconsistency of using /urls/:id in the instructions
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  console.log(urlDatabase);
  res.redirect("/urls");
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