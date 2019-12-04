const { db } = require('../util/admin');

exports.getAllScreams = (req, res) => {
	db
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
};

exports.postOneScream = (req, res) => {
	const newScream = {
		body: req.body.body,
		user_handle: req.user.handle,
		created_at: new Date().toISOString()
	};
	db
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
};
