var express = require('express');
var ObjectID = require('mongodb').ObjectID
var Issues = require("../reporter/objects/issues").Issues;
var Users = require("../reporter/objects/users").Users;
var Message = require("../reporter/messaging").Message;
var router = express.Router();

/* Index page */
router.get("/", function(req, res) {
	Issues.getIssues(function(err, documents) {
		res.render('front', {"issues" : documents, "messages" : Message.getAllMessages(), "user" : req.user});
	});
});

/* Page for a single issue */
router.get("/issues/:issue_id", function(req, res) {
	res.send("HELLO" + req.params.issue_id);	//DO SOMETHING USEFUL
});

module.exports = router;
