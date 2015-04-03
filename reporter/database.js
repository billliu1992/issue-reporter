var MongoClient = require("mongodb").MongoClient
var Server = require("mongodb").Server;
var winston = require("winston");


(function() {
	var dbPromise = new Promise(function(resolve, reject) {
		/* Change later */
		var mongoClient = new MongoClient(new Server('localhost', 27017));
		mongoClient.open(function(error, mClient) {
			if(error) {
				reject(error);
			}
			dbObj = mClient.db("issue_db");

			resolve(dbObj);
		});
	});

	function reportError(error) {
		console.log(error);
		if(error) {
			console.log("E");
		}
	}

	DatabaseService = {

		find : function(coll, query, callback) {
			dbPromise.then(function(dbObj) {
				dbObj.collection(coll).find(query).toArray(function(cError, docs) {
					if(cError) {
						winston.error(cError, {time: Date.now()});
						callback(cError);
						return;
					}

					callback(null, docs);
				});
			})
			.catch(function() {
				callback(err)
			});
		},

		findOne : function(coll, query, callback) {
			DatabaseService.findLimited(coll, query, 1, 0, function(error, docs) {
				if(error) {
					callback(error);
					return;
				}

				if(docs.length <= 0) {
					callback("Found nothing when querying " + coll + " with " + JSON.stringify(query));
					return;
				}

				callback(null, docs[0]);
			});
		},

		findLimited : function(coll, query, limit, skip, callback) {
			dbPromise.then(function(dbObj) {

				dbObj.collection(coll).find(query).skip(skip).limit(limit).toArray(function(cError, docs) {
					if(cError !== null) {
						console.log(cError);
						winston.error(cError, {time: Date.now()});
						callback(cError);
						return;
					}

					callback(null, docs);
				});
			})
			.catch(function() {
				callback(err)
			});
		},

		insert : function(coll, newObj, callback) {
			dbPromise.then(function(dbObj) {
				dbObj.collection(coll).insert(newObj, function(error, inserted) {
					if(error) {
						winston.error(error, {time: Date.now()});
						callback(error);
						return;
					}

					callback(null, inserted);
				});
			})
			.catch(function() {
				callback(err)
			});
		},

		update : function(coll, query, update, callback) {
			dbPromise.then(function(dbObj) {
				dbObj.collection(coll).update(query, update, function(error, result) {
					if(error) {
						winston.error(error, {time: Date.now()});
						callback(error);
						return;
					}

					callback(null, result);
				});
			})
			.catch(function() {
				callback(err)
			});
		},

		aggregate : function(coll, pipeline, callback) {
			dbPromise.then(function(dbObj) {
				dbObj.collection(coll).aggregate(pipeline, function(error, resultList) {
					if(error) {
						winston.error(error, {time: Date.now()});
						callback(error);
						return;
					}

					callback(null, resultList);
				});
			})
			.catch(function() {
				callback(err)
			});
		},

		remove : function(coll, query, callback) {
			dbPromise.then(function(dbObj) {
				dbObj.collection(coll).remove(pipeline, function(error, removedNumber) {
					if(error) {
						winston.error(error, {time: Date.now()});
						callback(error);
						return;
					}

					callback(null, removedNumber);
				});
			})
			.catch(function() {
				callback(err)
			});
		},

		custom : function(callback) {
			dbPromise.then(function(dbObj) {
				callback(dbObj);
			})
			.catch(function() {
				callback(err)
			});
		}
	}
})()

exports.DatabaseService = DatabaseService;