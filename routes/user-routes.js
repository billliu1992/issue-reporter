var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var ObjectID = require('mongodb').ObjectID
var Issues = require("../reporter/objects/issues").Issues;
var Projects = require("../reporter/objects/issues").Projects;
var Users = require("../reporter/objects/users").Users;
var Message = require("../reporter/messaging").Message;
var router = express.Router();


/* Passport login stuff */
passport.use(
	new LocalStrategy(function(username, password, done) {
		Users.checkUserPassword(username, password, function(err, user) {
			if(err !== null) {
				done(null, false);
				Message.addMessage("Wrong e-mail and/or password", Message.ERROR);
				return;
			}

			Message.addMessage("Successfully logged in", Message.SUCCESS);
			done(null, user);
		});
	})
);

passport.serializeUser(function(user, done) {
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	Users.getUserById(ObjectID(id), function(error, userObj) {
		if(error) {
			done(error);
		}
		else {
			done(null, userObj);
		}
	});
});


/* User Authentication */
router.post('/user/login',
	function(req, res, next) {
		var redirect = req.query.redirect

		passport.authenticate('local', function(err, user, info) {
			if(err) {
				return next(err);
			}
			if(!user) {
				return res.redirect("/");
			}
			req.logIn(user, function(err) {
				if (err) { return next(err); }
				return res.redirect(redirect);
			});
		})(req, res, next)
	}
);

router.get("/user/logout", function(req, res) {
	req.logout();
	Message.addMessage("Successfully logged out", Message.SUCCESS);
	res.redirect("/");
});

router.get("/user/create", function(req, res) {
	res.render("new_user")
});

router.post("/user/create", function(req, res) {
	var username = req.body["username"];
	var password1 = req.body["password1"];
	var password2 = req.body["password2"];

	if(password1 === password2) {
		Users.createUser(username, "Test", "Test", password1, function() {});
	}

	res.redirect("/");
});

/* User query */
router.get("/user/query/", function(req, res) {
	var query = req.query.query;
	
	Users.userQuery(query, 5, function(err, resultList) {
		if(err) {
			errObj = {
				error: err
			}
			res.send(JSON.stringify(errObj));
			return;
		}

		var result = JSON.stringify(resultList);
		res.send(result);
	});
});

/* User Prefs */
router.get("/user/:user_id", function(req, res) {
	var userId = ObjectID(req.params.user_id);

	Users.getUserById(userId, function(err, userObj) {
		if(err !== null) {
			Message.addMessage("Error: " + err, Message.ERROR);
			res.redirect("/");
			return;
		}

		res.render("user/profile", { "publicUser" : userObj });
	});

});

/* Get user roles */
router.get("/user/:user_id/roles", function(req, res) {
	var pubUserId = ObjectID(req.params.user_id);

	//Roles.getProjectRolesByUserId(pubUserId, 
});


module.exports = router;