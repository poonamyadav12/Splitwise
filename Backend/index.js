//import the require dependencies
import express from 'express';
var app = express();
import { json, urlencoded } from 'body-parser';
import session from 'express-session';
//var cookieParser = require('cookie-parser');
import cors from 'cors';
import { createUser, getUsersBySearchString, validateLogin } from './apis/user_api';
import { createOrUpdateGroup, getAllGroupsForUser, getGroupDetails } from './apis/group_api';
import { createTransaction, getAllTransactionsForFriend, getAllTransactionsForGroup, getAllTransactionsForUser, getTransactionsByUserId } from './apis/transactions_api';
import { getActivities } from './apis/activity_api';
import { uploadImage } from './apis/image_upload';

app.set('view engine', 'ejs');

//use cors to allow cross origin resource sharing
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

//use express session to maintain session data
app.use(session({
    secret: 'cmpe273_kafka_passport_mongo',
    resave: false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false, // Force to save uninitialized session to db. A session is uninitialized when it is new but not modified.
    duration: 60 * 60 * 1000,    // Overall duration of Session : 30 minutes : 1800 seconds
    activeDuration: 5 * 60 * 1000
}));

// load app middlewares
app.use(json());
app.use(urlencoded({ extended: false }));

//Allow Access Control
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

var Users = [{
    username: "admin",
    password: "admin"
}]

var books = [
    { "BookID": "1", "Title": "Book 1", "Author": "Author 1" },
    { "BookID": "2", "Title": "Book 2", "Author": "Author 2" },
    { "BookID": "3", "Title": "Book 3", "Author": "Author 3" }
]

//Route to handle Post Request Call
app.post('/login', function (req, res) {

    // Object.keys(req.body).forEach(function(key){
    //     req.body = JSON.parse(key);
    // });
    // var username = req.body.username;
    // var password = req.body.password;
    console.log("Inside Login Post Request");
    //console.log("Req Body : ", username + "password : ",password);
    console.log("Req Body : ", req.body);
    Users.filter(function (user) {
        if (user.username === req.body.username && user.password === req.body.password) {
            res.cookie('cookie', "admin", { maxAge: 900000, httpOnly: false, path: '/' });
            req.session.user = user;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end("Successful Login");
        } else {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end(JSON.stringify({ "msg": "Please enter correct Username and Password" }));
        }
    });
});

//Route to get All Books when user visits the Home Page
app.post('/create', function (req, res) {
    console.log("Inside create request");
    const bookId = req.body.bookId;
    const bookTitle = req.body.bookTitle;
    const bookAuthor = req.body.bookAuthor;
    var bookisUnique = true;
    books.forEach((book) => {
        console.log(book.BookID)
        if (book.BookID === req.body.bookId.toString()) {
            bookisUnique = false;
            res.writeHead(500, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({ "msg": "Book ID already exists. Please enter unique Book ID" }));
        }
    });

    if (bookisUnique) {
        books.push({ BookID: bookId, Title: bookTitle, Author: bookAuthor });
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
    }



    console.log("Books : ", JSON.stringify(books));


    res.end(JSON.stringify(books));
})

//Route the handle delete request

app.post('/delete', function (req, res) {
    console.log("Inside delete request");
    let bookDeleted = false;
    console.log(req.body);
    for (var i = 0; i < books.length; i++) {
        console.log(books[i].BookID);
        if (books[i].BookID === req.body.bookId.toString()) {
            books.splice(i, i);
            bookDeleted = true;
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
        }
    }

    if (!bookDeleted) {
        res.writeHead(500, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({ "msg": "Book ID does not exist. Please enter existing Book ID" }));
    }

    console.log("Books : ", JSON.stringify(books));
    res.end(JSON.stringify(books));
})

//Route to handle post request call of create book 
app.get('/home', function (req, res) {
    console.log("Inside Home Login 34");
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    console.log("Books : ", JSON.stringify(books));
    res.end(JSON.stringify(books));
});

//Route to handle CreateUser Post Request Call
app.post('/user/signup', createUser);

//Route to handle Login get Request Call
app.post('/user/login', validateLogin);

//Route to handle create group Request Call
app.post('/group/createOrUpdate', createOrUpdateGroup);

//Route to handle get group Request Call
app.get('/group/get', getGroupDetails);

//Route to handle get group Request Call
app.get('/group/transactions', getAllTransactionsForGroup);

//Route to handle get group Request Call
app.get('/user/groups', getAllGroupsForUser);

app.get('/user/search', getUsersBySearchString);

//Route to handle create group Request Call
app.post('/transaction/create', createTransaction);

app.get('/transaction/friend', getAllTransactionsForFriend);

app.get('/user/activity', getActivities);

app.post('/image-upload', uploadImage);

app.get('/user/transactions',getAllTransactionsForUser);

//Route to handle get group Request Call
//app.get('/groups/transactions', );

//start your server on port 3001
app.listen(3001);

console.log("Server Listening on port 3001");