var express = require('express');
var ObjectID = require('mongodb').ObjectID
var Issues = require("../reporter/objects/issues").Issues;
var Users = require("../reporter/objects/users").Users;
var Projects = require("../reporter/objects/issues").Projects;
var Message = require("../reporter/messaging").Message;
var router = express.Router();

/* Locals */
router.use(function(req, res, next) {
    res.locals.messages = Message.getAllMessages();
    res.locals.user = req.user;
    res.locals.currentUrl = req.originalUrl
    next();
});

/* Index page */
router.get("/", function(req, res) {

	Projects.getProjects(function(err, projects) {
		if(err !== null) {
			Message.addMessage(err, Message.ERROR);
			return res.redirect("/");
		}

		Issues.getIssues(function(err, issues) {
			if(err !== null) {
				Message.addMessage(err, Message.ERROR);
				return res.redirect("/");
			}

			res.render('front', {"issues" : issues, projects : projects});
		});
	});
});

module.exports = router;
