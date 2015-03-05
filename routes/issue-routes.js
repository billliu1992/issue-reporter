var express = require('express');
var ObjectID = require('mongodb').ObjectID
var Issues = require("../reporter/objects/issues").Issues;
var Projects = require("../reporter/objects/issues").Projects;
var Users = require("../reporter/objects/users").Users;
var Message = require("../reporter/messaging").Message;
var router = express.Router();

/* Page to create a project */
router.get("/project/create", function(req, res) {
	res.render("create_project", {});
});

router.post("/project/create", function(req, res) {
	if(!req.user) {
		// Do role check here

		Message.addMessage("Not logged in!", Message.ERROR);
		res.redirect("/");
		return;
	}

	Projects.createProject(req.body["project-name"], req.body["project-desc"], req.body["project-url"], req.body["project-hidden"], function(err, newProj) {
		if(err !== null) {
			Message.addMessage(err, Message.ERROR);
			res.redirect("/");
			return;
		}

		res.redirect("/project/" + newProj.slug);
	});
});

/* Project main page */
router.get("/project/:project_slug/", function(req, res) {

	var slug = req.params.project_slug

	Projects.getProjectBySlug(slug, function(error, project) {

		if(error !== null) {
			Message.addMessage(error, Message.ERROR);
			res.redirect("/");
			return;
		}

		Issues.getIssuesOfProject(ObjectID(project._id), function(err, projectIssues) {
			res.render('project_front', {"issues" : projectIssues, "project" : project });
		});
	});
});

/* Page for a single issue */
router.get("/project/:project_slug/issues/:issue_id", function(req, res) {

	var issueId = req.params.issue_id

	Issues.getIssue(ObjectID(issueId), function(err, issue) {
		if(err !== null) {
			Message.addMessage(err, Message.ERROR);
			return res.redirect("/");
		}

		res.render("issue", {issue : issue});
	});
});

/* Page to create an issue */
router.get("/project/:project_slug/create", function(req, res) {
	res.render("create", {});
});

/* Handle POST data for creating issues */
router.post("/project/:project_slug/create", function(req, res) {

	if(!req.user) {
		Message.addMessage("Not logged in!", Message.ERROR);
		res.redirect("/");
		return;
	}

	var name = req.body["issue-name"];
	var body = req.body["issue-body"];
	var priority = req.body["issue-priority"];
	var internal = req.body["issue-internal"];	
	var project = req.params.project_slug

	Projects.getProjectBySlug(project, function(err, project) {
		var newIssue = {
				"name" : name, 
				"description" : body,
				"issueType" : "Test",
				"priority" : priority,
				"reporter" : {
					"name" : req.user.firstName + " " + req.user.lastName,
					"id" : req.user._id
				},
				"projectId" : project._id,
				"internal" : internal,
			}

		Issues.createIssue(newIssue, function(err, issue) {
			if(err) {
				Message.addMessage("Error creating issue", Message.ERROR);

				res.redirect("/project/" + req.params.project_slug + "/");
				return;
			}
			Message.addMessage("Successfully created issue!", Message.SUCCESS);

			res.redirect("/");	
		});
	});
});

module.exports = router;