const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = express();

// get from database
app.get('/screams', (req, res) => {
	admin
		.firestore()
		.collection('screams')
		.get()
		.then((querySnapshot) => {
			let screams = [];
			querySnapshot.forEach((doc) => {
				screams.push(doc.data());
			});
			res.json(screams);
		})
		.catch((err) => console.error(err));
});

admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

// create scream
exports.createScream = functions.https.onRequest((req, res) => {
	if (req.method != 'POST') {
		res.status(400).json({ error: 'Method not allowed.' });
	}
	const newScream = {
		body: req.body.body,
		user_handle: req.body.user_handle,
		created_at: admin.firestore.Timestamp.fromDate(new Date())
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

exports.api = functions.https.onRequest(app);
