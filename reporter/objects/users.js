var bcrypt = require("bcryptjs");
var winston = require("winston");
var MongoClient = require("mongodb").MongoClient;
var Server = require("mongodb").Server;
var database = require('../database.js');

var Roles = function() {
	return {
		createRole : function(name, projectId, callback) {
			var roleObj = {
				name : name,
				projectId : projectId,
				permissions : []
			}

			database.getDb(function(db, err) {
				db.collection("roles").insert(roleObj, function(error, inserted) {
						if(error) {
							winston.error(error, {time: Date.now()});
							callback(error);
							return;
						}

						callback(null, inserted);
					}
				);
			});
		},
		getRole : function(name, projectId, callback) {
			database.getDb(function(error, db) {
				db.collection("users").find({ name : name, projectId : projectId }, function(error, cursor) {

					if(error !== null) {
						winston.error(error, {time: Date.now()});
						return;
					}

					cursor.toArray(function(err, documents) {
						if(err !== null) {
							winston.error(error, {time: Date.now()});
							callback(err);
						}

						if(documents.length !== 0) {
							callback(null, documents[0]);
						}
						else {
							callback("Role not found in project: " + projectId + " with name: " + name);
						}
					});
				});
			});
		},
		addPermission : function(name, projectId, permission, callback) {
			database.getDb(function(error, db) {
				db.collection("roles").update( {name : name, projectId : projectId}, 
					{ $push : { permissions : permission } },
					function(err, result) {
						if(err !== null) {
							winston.error(err);
							callback(err);
							return;
						}

						callback(null, result);
					}
				);
			});
		}
	}
}

var Users = function() {
	var passSalt = bcrypt.genSaltSync();

	return {
		createUser : function(email, firstName, lastName, password, callback) {
			this.fetchUserByEmail(email, function(user) {	// Check to make sure this is not an already registered email

				if(user === null) {
					var passHash = bcrypt.hashSync(password, passSalt);

					var userObj = {
						email : email,
						firstName : firstName,
						lastName : lastName,
						password : passHash,
						createDate : Date.now(),
						lastLoggedInDate : Date.now(),
					}

					database.getDb(function(err, db) {
						db.collection("users").insert(userObj, function(error, inserted) {
								if(error) {
									winston.error(error, {time: Date.now()});
									callback(error);
									return;
								}

								callback(null, inserted);
							}
						);
					});

				}
				else {
					callback(err);
				}
			});
		},

		getUserByEmail : function(findEmail, callback) {
			database.getDb(function(error, db) {
				db.collection("users").find({ email : findEmail }, function(error, cursor) {

					if(error !== null) {
						winston.error(error, {time: Date.now()});
						return;
					}

					cursor.toArray(function(err, documents) {
						if(err !== null) {
							winston.error(error, {time: Date.now()});
							callback(err);
						}

						if(documents.length !== 0) {
							callback(null, documents[0]);
						}
						else {
							callback("No user found with e-mail: " + findEmail);
						}
					});
				});
			});
		},

		fetchUserByEmail : function(findEmail, callback) {
			this.getUserByEmail(findEmail, function(err, user) {
				if(err !== null) {
					winston.error(err);
					callback(null);
				}
				else {
					callback(user);
				}
			});
		},


		getUserById : function(userId, callback) {
			database.getDb(function(error, db) {
				db.collection("users").find({ _id : userId }, function(err, cursor) {
					if(error) {
						callback(err);
					}

					cursor.toArray(function(er, documents) {
						if(er) {
							callback(er);
							return;
						}

						if(documents.length != 0) {
							callback(null, documents[0]);
						}
						else {
							callback("No user of ID: " + userId);
						}
					});

				});
			});
		},

		checkUserPassword : function(email, password, callback) {
			this.getUserByEmail(email, function(err, userObj) {
				if(err) {
					winston.error(err);
					callback(err);
					return;
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
exports.Roles = Roles;