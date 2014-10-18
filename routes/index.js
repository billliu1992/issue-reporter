var express = require('express');
var IssuesDAO = require("../persistance/issues").IssuesDAO;
var router = express.Router();

var issues = new IssuesDAO();

router.get("/", function(request, result) {

	var allIssues = issues.getIssues();

	result.render('front', {"issues" : allIssues});
});

router.get("/create", function(request, result) {
	result.render("create");
});

router.post("/create", function(request, result) {
});

module.exports = router;
