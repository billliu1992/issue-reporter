var Database = require('../database').DatabaseService;
var winston = require("winston");
var Projects = require("./projects").Projects

var reqFields = ["name", "description", "issueType", "reporter", "projectSlug"];

function isValidIssueObj(obj) {
	for(fieldIndex in reqFields) {
		if(!(reqFields[fieldIndex] in obj)) {
			return false;
		}
	}

	return true;
} 

var IssuesService = {
	createIssue : function(issueObj, projectSlug, callback) {
		Projects.getAndIncProjectIssueCount(projectSlug, function(err, count) {
			if(isValidIssueObj(issueObj)) {
				issueObj.createDate = Date.now();
				issueObj.modifiedDate = Date.now();
				issueObj.votes = 0;
				issueObj.issueNum = count;

				DatabaseService.insert("issues", issueObj, callback);
			}
			else {
				callback("Got missing fields");
			}
		});
	},
	
	getIssues : function(callback) {
		DatabaseService.find("issues", {}, callback);
	},

	getIssuesOfProject : function(projectSlug, callback) {
		DatabaseService.find("issues", { projectSlug : projectSlug }, callback);
	},

	getIssue : function(issueId, callback) {
		DatabaseService.find("issues", { _id : issueId }, callback);
	},

	getIssueByProjectAndNumber : function(projectSlug, issueNum, callback) {
		DatabaseService.findOne("issues", { projectSlug : projectSlug, issueNum : issueNum }, callback);
	},

	updateIssue : function(issueObj, projectSlug, issueNum, callback) {
		if(isValidIssueObj(issueObj)) {
			Database.update("issues", { projectSlug : projectSlug, issueNum : issueNum }, { $set : issueObj }, callback);
		}
		else {
			callback("Not enough fields");
		}
	}
	
}

exports.Issues = IssuesService;