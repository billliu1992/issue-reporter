var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var ObjectID = require('mongodb').ObjectID
var Issues = require("../reporter/objects/issues").Issues;
var Users = require("../reporter/objects/users").Users;
var Message = require("../reporter/messaging").Message;
var router = express.Router();

var issues = new Issues();
var message = new Message();
var users = new Users();

/* Passport login stuff */
passport.use(
	new LocalStrategy(function(username, password, done) {
		users.checkUserPassword(username, password, function(err, user) {
			if(err !== null) {
				done(null, false);
				return;
			}

			message.addMessage("Successfully logged in", Message.SUCCESS);
			done(null, user);
		});
	})
);

passport.serializeUser(function(user, done) {
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	users.getUserById(ObjectID(id), function(error, userObj) {
		if(error) {
			done(error)
		}
		else {
			done(null, userObj);
		}
	});
});

/* Routes */
router.post('/login', passport.authenticate('local', { successRedirect: '/',failureRedirect: '/'}),
	function(req, res, next) {
		res.redirect("/");
	}
);

router.get("/create/user", function(req, res) {
	res.render("new_user")
});

router.post("/create/user", function(req, res) {
	var username = req.body["username"];
	var password1 = req.body["password1"];
	var password2 = req.body["password2"];

	if(password1 === password2) {
		users.createUser(username, "Test", "Test", password1, function() {});
	}

	res.redirect("/");
});


/* Index page */
router.get("/", function(req, res) {
	issues.getIssues(function(err, documents) {

		console.log(documents);

		res.render('front', {"issues" : documents, "messages" : message.getAllMessages(), "user" : req.user});
	});
});

/* Page for a single issue */
router.get("/issues/:issue_id", function(req, res) {
	res.send("HELLO" + req.params.issue_id);	//DO SOMETHING USEFUL
});

/* Page to create an issue */
router.get("/create", function(req, res) {
	res.render("create");
});

/* Handle POST data for creating issues */
router.post("/create", function(req, res) {

	if(!req.user) {
		message.addMessage("Not logged in!", Message.ERROR);
		res.redirect("/");
		return;
	}

	var name = req.body["issue-name"];
	var body = req.body["issue-body"];
	var priority = req.body["issue-priority"];
	var internal = req.body["issue-internal"];

	var newIssue = {
			"name" : name, 
			"description" : body,
			"issueType" : "Test",
			"priority" : priority,
			"reporterId" : req.user._id,
			"internal" : internal,
		}

	issues.createIssue(newIssue, function(err, issue) {
		if(err) {
			message.addMessage("Error creating issue", Message.ERROR);

			res.redirect("/create");
			return;
		}
		message.addMessage("Successfully created issue!", Message.SUCCESS);

		res.redirect("/");	
	});
});

module.exports = router;
