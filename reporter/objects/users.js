var bcrypt = require("bcryptjs");
var winston = require("winston");
var Database = require('../database.js').DatabaseService;

var passSalt = bcrypt.genSaltSync();

var UsersService = {
	createUser : function(email, firstName, lastName, password, callback) {
		UsersService.fetchUserByEmail(email, function(user) {	// Check to make sure this is not an already registered email

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

				DatabaseService.insert("users", userObj, callback);
			}
			else {
				callback(err);
			}
		});
	},

	getUserByEmail : function(findEmail, callback) {
		DatabaseService.findOne("users", { email : findEmail }, callback);
	},

	fetchUserByEmail : function(findEmail, callback) {
		UsersService.getUserByEmail(findEmail, function(err, user) {
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
		DatabaseService.findOne("users", { _id : userId }, callback);
	},

	checkUserPassword : function(email, password, callback) {
		UsersService.getUserByEmail(email, function(err, userObj) {
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
		DatabaseService.aggregate("users", 
			[
				{ $project : { fullName : { $concat : [ "$firstName", " ", "$lastName" ] } } },
				{ $match : { fullName : { $regex : "^" + query, $options : "i" } } }
			],
			function(err, queriedUsers) {
				if(err !== null) {
					winston.error(err);
					callback(err);
					return;
				}

				console.log(queriedUsers);

				callback(null, queriedUsers);
			});
	}
}


exports.Users = UsersService;