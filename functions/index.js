const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const firebaseConfig = {
	apiKey: 'AIzaSyBpQ9plexYxOSCGXQ02oDNK2dQ16nSlBOg',
	authDomain: 'social-media-clone-70837.firebaseapp.com',
	databaseURL: 'https://social-media-clone-70837.firebaseio.com',
	projectId: 'social-media-clone-70837',
	storageBucket: 'social-media-clone-70837.appspot.com',
	messagingSenderId: '396771421612',
	appId: '1:396771421612:web:0458b058a3082de4531e09',
	measurementId: 'G-X0CDK7678K'
};

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

// get from database
app.get('/screams', (req, res) => {
	admin
		.firestore()
		.collection('screams')
		.orderBy('created_at', 'desc')
		.get()
		.then((querySnapshot) => {
			let screams = [];
			querySnapshot.forEach((doc) => {
				screams.push({
					screamID: doc.id,
					...doc.data()
				});
			});
			res.json(screams);
		})
		.catch((err) => console.error(err));
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

// create scream
app.post('/scream', (req, res) => {
	const newScream = {
		body: req.body.body,
		user_handle: req.body.user_handle,
		created_at: new Date().toISOString()
	};
	admin
		.firestore()
		.collection('screams')
		.add(newScream)
		.then((doc) => {
			res.json({
				message: `document ${doc.id} created successfully`
			});
		})
		.catch((err) => {
			res.status(500).json({ error: 'something went wrong' });
			console.error(err);
		});
});

const isEmail = (email) => {
	const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (email.match(emailRegEx)) return true;
	else return false;
};

const isEmpty = (str) => {
	if (str.trim() === '') return true;
	return false;
};

app.post('/signup', (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		handle: req.body.handle
	};

	// User Validation
	let errors = {};
	if (isEmpty(newUser.email)) errors.email = 'Must not be empty.';
	else if (!isEmail(newUser.email)) errors.email = 'Must be a valid email address.';
	if (isEmpty(newUser.password)) errors.password = 'Must not be empty.';
	if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Password must match.';
	if (isEmpty(newUser.handle)) errors.handle = 'Must not be empty.';
	if (Object.keys(errors).length > 0) return res.status(400).json(errors);

	let token, user_id;
	db
		.doc(`/users/${newUser.handle}`)
		.get()
		.then((doc) => {
			if (doc.exists) {
				return res.status(400).json({ handle: 'This handle is already taken.' });
			} else {
				return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
			}
		})
		.then((data) => {
			user_id = data.user.uid;
			return data.user.getIdToken();
		})
		.then((tokenv) => {
			token = tokenv;
			const userCredentials = {
				handle: newUser.handle,
				email: newUser.email,
				created_at: new Date().toISOString(),
				user_id: user_id
			};
			return db.doc(`/users/${newUser.handle}`).set(userCredentials);
		})
		.then(() => {
			return res.status(201).json({ token });
		})
		.catch((err) => {
			console.error(err);
			res.status(500).json({ error: err.code });
		});
});

exports.api = functions.https.onRequest(app);
