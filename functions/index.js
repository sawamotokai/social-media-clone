const functions = require('firebase-functions');
const app = require('express')();
const { getAllScreams, postOneScream } = require('./handlers/screams');
const { signUp, login } = require('./handlers/users');
const FBAuth = require('./util/fbAuth');
// scream routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
// user routes
app.post('/signup', signUp);
app.post('/login', login);

exports.api = functions.https.onRequest(app);
