var express = require('express');
var IssuesDAO = require("../reporter/persistance/issues").IssuesDAO;
var Message = require("../reporter/messaging").Message;
var router = express.Router();

var issues = new IssuesDAO();
var message = new Message();

/* Index page */
router.get("/", function(req, res) {

	issues.getIssues(function(documents) {
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

	issues.createIssue(newIssue);
	message.addMessage("Successfully created issue!", Message.SUCCESS);

	res.redirect("/create");
});

module.exports = router;
