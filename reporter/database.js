var MongoClient = require("mongodb").MongoClient
var Server = require("mongodb").Server;

/* Change later */
var mongoClient = new MongoClient(new Server('localhost', 27017))

var dbObj = null;

exports.getDb = function(callback) {
	if(dbObj) {
		callback(null, dbObj);
	}
	else {
		mongoClient.open(function(error, mClient) {
			if(error) {
				callback(error);
			}
			dbObj = mClient.db("issue_db");

			callback(null, dbObj);
		});
	}
};
