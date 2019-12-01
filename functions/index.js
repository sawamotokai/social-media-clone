const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
	response.send('Hello from Firebase!');
});

// get from database
exports.getScreams = functions.https.onRequest((req, res) => {
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
