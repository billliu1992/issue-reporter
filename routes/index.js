var express = require('express');
var Issues = require("../reporter/objects/issues").Issues;
var Users = require("../reporter/objects/users").Users;
var Message = require("../reporter/messaging").Message;
var router = express.Router();

var issues = new Issues();
var message = new Message();
var users = new Users();

/* Index page */
router.get("/", function(req, res) {

	issues.getIssues(function(documents) {

		console.log(message.hasMessages());

		res.render('front', {"issues" : documents, "messages" : message.getAllMessages()});
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
	var name = req.body["issue-name"];
	var body = req.body["issue-body"];
	var priority = req.body["issue-priority"];
	var internal = req.body["issue-internal"];

	var newIssue = {
			"title" : name, 
			"body" : body,
			"type" : "Test",
			"priority" : priority,
			"create_date" : new Date(),
			"modified_date" : new Date(),
			"reporter" : 0,
			"assignee" : 0,
			"internal" : internal,
			"votes" : 0
		}

	issues.createIssue(newIssue, function() {
		message.addMessage("Successfully created issue!", Message.SUCCESS);

		res.redirect("/");
	},
	function() {
		message.addMessage("Error creating issue", Message.ERROR);

		res.redirect("/create");
	});
});

router.post("/login", function(req, res) {
	var username = req.body["username"];
	var password = req.body["password"];

	users.checkUserPassword(username, password, function() {
		message.addMessage("Successfully logged in", Message.SUCCESS);
		res.redirect("/");
	},
	function() {
		message.addMessage("Error logging in", Message.ERROR);
		res.redirect("/");
	});

	

});

router.get("/create/user", function(req, res) {
	res.render("new_user")
});

router.post("/create/user", function(req, res) {
	var username = req.body["username"];
	var password1 = req.body["password1"];
	var password2 = req.body["password2"];

	if(password1 === password2) {
		users.createUser(username, password1);
	}

	res.redirect("/");
});

module.exports = router;
