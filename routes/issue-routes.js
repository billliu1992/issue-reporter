var express = require('express');
var ObjectID = require('mongodb').ObjectID
var Issues = require("../reporter/objects/issues").Issues;
var Users = require("../reporter/objects/users").Users;
var Message = require("../reporter/messaging").Message;
var router = express.Router();


/* Page to create an issue */
router.get("/create", function(req, res) {
	res.render("create", {"messages" : message.getAllMessages(), "user" : req.user});
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
			"reporter" : {
				"name" : req.user.firstName + " " + req.user.lastName,
				"id" : req.user._id
			},
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