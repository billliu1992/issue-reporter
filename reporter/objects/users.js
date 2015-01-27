var bcrypt = require("bcryptjs");
var ReporterMongoServer = require('./database.js');


var Users = function() {
	var passSalt = bcrypt.genSaltSync();

	return {
		createUser : function(username, password) {
			var passHash = bcrypt.hashSync(password, passSalt);

			ReporterMongoServer.client.open(function(error, mClient) {
				var db = mClient.db("issue_db");

				var userObj = {
						username : username,
						password : passHash
					}

				db.collection("users").insert(userObj, function(error, inserted) {
						if(error) {
							console.log(error);
						}

						/* Doing something here */

						mClient.close();
					}
				);
			}); 
		},

		getUser : function(findUsername, successCallback, errorCallback) {
			ReporterMongoServer.client.open(function(error, mClient) {

				var db = mClient.db("issue_db");

				db.collection("users").find({ username : findUsername }, function(error, cursor) {

					if(error !== null) {
						console.log("Got error getting user: " + error);
						return;
					}

					cursor.toArray(function(err, documents) {
						if(err !== null) {
							console.log("Got error getting user: " + err);
							errorCallback();
						}

						successCallback(documents[0]);

						mClient.close();
					});
				});

			});
		},

		checkUserPassword : function(username, password, successCallback, errorCallback) {
			this.getUser(username, function(userObj) {
				var authenticated = bcrypt.compareSync(password, userObj['password'])
			
				if(authenticated) {
					successCallback();
					console.log("SUCCESS");
				}
				else {
					errorCallback();

					console.log("ERROR");
				}

			});
		}
	}
}

exports.Users = Users;