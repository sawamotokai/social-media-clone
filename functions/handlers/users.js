const { db } = require('../util/admin');
const firebaseConfig = require('../util/config');
const firebase = require('firebase/app');
require('firebase/auth');
const { validateSignupData, validateLoginData } = require('../util/validator');

firebase.initializeApp(firebaseConfig);

exports.signUp = (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		handle: req.body.handle
	};

	const { errors, valid } = validateSignupData(newUser);
	if (!valid) return res.status(400).json(errors);

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
			if (err.code === 'auth/wrong-password')
				return res.status(403).json({ general: 'Wrong credential, please try again.' });
			res.status(500).json({ error: err.code });
		});
};

exports.login = (req, res) => {
	const user = {
		email: req.body.email,
		password: req.body.password
	};

	const { errors, valid } = validateLoginData(user);
	if (!valid) return res.status(400).json(errors);

	firebase
		.auth()
		.signInWithEmailAndPassword(user.email, user.password)
		.then((data) => {
			return data.user.getIdToken();
		})
		.then((token) => {
			return res.json(token);
		})
		.catch((err) => {
			console.error(err);
			if (err.code === 'auth/wrong-password')
				return res.status(403).json({ general: 'Wrong credential, please try again.' });
			else return res.status(500).json({ error: err.code });
		});
};
