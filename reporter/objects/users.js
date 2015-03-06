var bcrypt = require("bcryptjs");
var winston = require("winston");
var MongoClient = require("mongodb").MongoClient;
var Server = require("mongodb").Server;
var database = require('../database.js');

var RolesService = function() {
	return {
		createRole : function(name, projectId, callback) {
			var roleObj = {
				name : name,
				permissions : [],
				projectId : projectId
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

		getProjectRolesByUserId : function(userId, projectId, callback) {
			database.getDb(function(error, db) {
				db.collection("users").find({ _id : userId }, function(error, cursor) {
					if(error !== null) {
						winston.error(error, {time: Date.now()});
						callback(error);
						return;
					}

					cursor.toArray(function(err, documents) {
						if(err !== null) {
							winston.error(error, {time: Date.now()});
							callback(err);
							return;
						}

						db.collection("roles").find({ _id : { $in : documents[0].roles }, projectId : projectId }, function(error, roleCursor) {
							cursor.toArray(function(roleError, roleDocs) {
								if(roleError !== null) {
									winston.error(error, {time: Date.now()});
									callback(roleError);
									return;
								}

								callback(null, roleDocs);
							});
						});
						
					});
				});
			});
		},

		checkUserPermission : function(userObj, projectId, permission, callback) {
			getRolesByUserId(userObj._id, projectId, function(err, roles) {
				if(err !== null) {
					callback(err);
					return;
				}

				for(role in roles) {
					if(permission in role.permissions) {
						callback(null, true);
					}
				}

				callback(null, false);
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
		},

		removePermission : function(name, projectId, permission, callback) {
			database.getDb(function(error, db) {
				db.collection("roles").update( {name : name, projectId : projectId}, 
					{ $pull : { permissions : permission } },
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

var UsersService = function() {
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
						roles : []
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
		},

		userQuery : function(query, queryNum, callback) {
			function transformForJson(userObj) {
				return {
					firstName : userObj.firstName,
					lastName : userObj.lastName,
					id : userObj._id
				}
			}

			database.getDb(function(error, db) {
				var queriedUsers = []

				db.collection("users").find({firstName : { $regex : "^" + query, $options : "i" } }, function(err, firstNameCursor) {
					firstNameCursor.toArray(function(err, matches) {
						for(var i = 0; i < Math.min(matches.length, queryNum - queriedUsers.length); i++) {
							queriedUsers.push(transformForJson(matches[i]));
						}

						if(queriedUsers.length < queryNum) {

							db.collection("users").find({lastName : { $regex : "^" + query, $options : "i" } }, function(err, lastNameCursor) {
								lastNameCursor.toArray(function(err, matches) {
									for(var o = 0; o < Math.min(matches.length, queryNum - queriedUsers.length); o++) {
										queriedUsers.push(transformForJson(matches[o]));
									}

									var fullName = query.split(" ");
									if(queriedUsers.length < queryNum && fullName.length >= 2) {
										db.collection("users").find({ firstName : { $regex : "^" + fullName[0], $options : "i" }, lastName : { $regex : "^" + fullName[1], $options : "i" } }, function(err, fullNameCursor) {
										
											fullNameCursor.toArray(function(err, matches) {
												for(var p = 0; p < Math.min(matches.length, queryNum - queriedUsers.length); p++) {
													queriedUsers.push(transformForJson(matches[p]));
												}

												callback(null, queriedUsers);
											});

											
										});
									
									}
									else {
										callback(null, queriedUsers);
									}
								});
							});
						}
						else {
							callback(null, queriedUsers);
						}
					});
				});
			});
		}
	}
}

exports.Users = new UsersService();
exports.Roles = new RolesService();