//import the require dependencies
import { json, urlencoded } from 'body-parser';
//var cookieParser = require('cookie-parser');
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { getActivities } from './apis/activity_api';
import { createGroup, getAllGroupsForUser, getGroupDetails, joinGroup, leaveGroup, updateGroup } from './apis/group_api';
import { uploadImage } from './apis/image_upload';
import { createTransaction, getAllTransactionsForFriend, getAllTransactionsForGroup, getAllTransactionsForUser, settleTransactions, updateTransactions } from './apis/transactions_api';
import { createUser, getUsersBySearchString, updateExistingUser, validateLogin } from './apis/user_api';
var app = express();

app.set('view engine', 'ejs');

//use cors to allow cross origin resource sharing
app.use(cors({ origin: `${process.env.CLIENT_URL}:3000`, credentials: true }));

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
    res.setHeader('Access-Control-Allow-Origin', `${process.env.CLIENT_URL}:3000`);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

//Route to handle CreateUser Post Request Call
app.post('/user/signup', createUser);

//Route to handle CreateUser Post Request Call
app.put('/user/update', updateExistingUser);

//Route to handle Login get Request Call
app.post('/user/login', validateLogin);

//Route to handle create group Request Call
app.post('/group/create', createGroup);

//Route to handle update group Request Call
app.post('/group/update', updateGroup);

//Route to handle leave group Request Call
app.post('/group/leave', leaveGroup);

//Route to handle join group Request Call
app.post('/group/join', joinGroup);

//Route to handle get group Request Call
app.get('/group/get', getGroupDetails);

//Route to handle get group Request Call
app.get('/group/transactions', getAllTransactionsForGroup);

//Route to handle get group Request Call
app.get('/user/groups', getAllGroupsForUser);

app.get('/user/search', getUsersBySearchString);

//Route to handle create txn Request Call
app.post('/transaction/create', createTransaction);

//Route to handle update txn Request Call
app.post('/transaction/update', updateTransactions);

//Route to handle settle transation
app.post('/transactions/settle', settleTransactions);

app.get('/transaction/friend', getAllTransactionsForFriend);

app.get('/user/activity', getActivities);

app.post('/image-upload', uploadImage);

app.get('/user/transactions', getAllTransactionsForUser);

//Route to handle get group Request Call
//app.get('/groups/transactions', );

//start your server on port 3001
app.listen(3001);

console.log("Server Listening on port 3001");

export default app;