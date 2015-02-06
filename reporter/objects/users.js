var bcrypt = require("bcryptjs");
var winston = require("winston");
var MongoClient = require("mongodb").MongoClient;
var Server = require("mongodb").Server;
var database = require('../database.js');

var Users = function() {
	var passSalt = bcrypt.genSaltSync();

	return {
		createUser : function(email, firstName, lastName, password) {
			var passHash = bcrypt.hashSync(password, passSalt);

			var userObj = {
					email : email,
					firstName : firstName,
					lastName : lastName,
					password : passHash,
					createDate : Date.now(),
					lastLoggedInDate : Date.now(),
				}

			database.getDb(function() {
				db.collection("users").insert(userObj, function(error, inserted) {
						if(error) {
							winston.error(error, {time: Date.now()});
						}

						/* Doing something here */
					}
				);
			});
		},

		getUser : function(findUsername, callback) {
			db.collection("users").find({ username : findUsername }, function(error, cursor) {

				if(error !== null) {
					winston.error(error, {time: Date.now()});
					return;
				}

				cursor.toArray(function(err, documents) {
					if(err !== null) {
						winston.error(error, {time: Date.now()});
						callback(err);
					}

					callback(null, documents[0]);
				});
			});
		},

		getUserById : function(userId, callback) {
			db.collection("users").find({ _id : userId }, function(err, cursor) {
				if(error) {
					callback(err);
				}

				cursor.toArray(function(er, documents) {
					if(er) {
						callback(er);
						return;
					}

					callback(null, documents[0]);
				});

			});
		},

		checkUserPassword : function(username, password, callback) {
			this.getUser(username, function(err, userObj) {
				if(err) {
					callback(err);
				}

				var authenticated = bcrypt.compareSync(password, userObj['password'])
			
				if(authenticated) {
					callback(null, userObj);

					winston.info(userObj.username + " successfully logged on", {time: Date.now()});
				}
				else {
					callback("Wrong password");
				}
			});
		}
	}
}

exports.Users = Users;
