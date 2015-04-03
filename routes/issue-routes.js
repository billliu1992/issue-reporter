var express = require('express');
var ObjectID = require('mongodb').ObjectID
var Issues = require("../reporter/objects/issues").Issues;
var Projects = require("../reporter/objects/projects").Projects;
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

	Projects.getProjectBySlug(slug, function(err, project) {
		if(err !== null) {
			Message.addMessage(err, Message.ERROR);
			res.redirect("/");
			return;
		}

		Issues.getIssuesOfProject(slug, function(err, projectIssues) {
			res.render('project_front', {"issues" : projectIssues, "project" : project });
		});
	});
});

/* Page for a single issue */
router.get("/project/:project_slug/issues/:issue_num/", function(req, res) {
	var projectSlug = req.params.project_slug;
	var issueNum = parseInt(req.params.issue_num);
	Issues.getIssueByProjectAndNumber(projectSlug, issueNum, function(err, issue) {
		if(err !== null) {
			Message.addMessage(err, Message.ERROR);
			return res.redirect("/");
		}

		res.render("issue", {issue : issue});
	});
});

router.get("/project/:project_slug/issues/:issue_num/edit/", function(req, res) {
	var issueNum = parseInt(req.params.issue_num);
	var projectSlug = req.params.project_slug

	Issues.getIssueByProjectAndNumber(projectSlug, issueNum, function(err, issue) {
		if(err !== null) {
			Message.addMessage(err, Message.ERROR);
			return res.redirect("/");
		}

		var tags = issue.tags;

		var tagsConcated = "";
		for(var i = 0; i < tags.length; i++) {
			tagsConcated += tags[i].toLowerCase() + " ";
		}

		res.render("create", {issue : issue, tags : tagsConcated});
	});
});

router.post("/project/:project_slug/issues/:issue_num/edit/", function(req, res) {
	if(!req.user) {
		Message.addMessage("Not logged in!", Message.ERROR);
		res.redirect("/");
		return;
	}

	var project = req.params.project_slug;
	var issueNum = parseInt(req.params.issue_num)

	var newIssue = createIssueFromReq(req);

	Issues.updateIssue(newIssue, project, issueNum, function(err, issue) {
		if(err) {
			Message.addMessage("Error editing issue", Message.ERROR);

			res.redirect("/project/" + req.params.project_slug + "/" + issueNum + "/");
			return;
		}
		Message.addMessage("Successfully edited issue!", Message.SUCCESS);

		res.redirect("/project/" + req.params.project_slug + "/issues/" + issueNum + "/");	
	});
});

/* Page to create an issue */
router.get("/project/:project_slug/create", function(req, res) {
	if(!req.user) {
		Message.addMessage("Not logged in!", Message.ERROR);
		res.redirect("/");
		return;
	}

	res.render("create", {});
});

/* Handle POST data for creating issues */
router.post("/project/:project_slug/create", function(req, res) {

	if(!req.user) {
		Message.addMessage("Not logged in!", Message.ERROR);
		res.redirect("/");
		return;
	}

	var project = req.params.project_slug;

	var newIssue = createIssueFromReq(req);

	Issues.createIssue(newIssue, project, function(err, issue) {
		if(err) {
			Message.addMessage("Error creating issue", Message.ERROR);

			res.redirect("/project/" + req.params.project_slug + "/");
			return;
		}
		Message.addMessage("Successfully created issue!", Message.SUCCESS);

		res.redirect("/");	
	});
});

function createIssueFromReq(req) {
	var tags = req.body["issue-tags"];

	var tagsSplit = tags.split(/[ ;,]+?/g).filter(
		function(element) {
			return element !== "";
		}
	);

	var project = req.params.project_slug;
	var assigneeId = req.body["ir-user-selected-id"];
	var assigneeName = req.body["ir-user-selected-full-name"];

	var newIssue = {
			"name" : req.body["issue-name"], 
			"description" : req.body["issue-body"],
			"issueType" : req.body["issue-type"],
			"priority" : req.body["issue-priority"],
			"reporter" : {
				"name" : req.user.firstName + " " + req.user.lastName,
				"id" : req.user._id
			},
			"tags" : tagsSplit,
			"version" : req.body["issue-version"],
			"projectSlug" : project,
			"internal" : req.body["issue-internal"],
		}

	if(assigneeId !== "" || assigneeId !== null) {
		newIssue.assignee = {
			"name" : assigneeName,
			"id" : assigneeId
		}
	}

	return newIssue;
}

module.exports = router;