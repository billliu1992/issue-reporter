var Database = require('../database').DatabaseService;
var winston = require("winston");

function isSlugAvailable(potentialSlug, callback) {
	DatabaseService.findLimited("projects", {slug : potentialSlug}, 1, 0, function(err, doc) {
		if(err !== null) {
			callback(err);
			return;
		}
		
		callback(doc.length === 0);
	});
}


var ProjectsService = {
	createProject : function(projectName, projectDesc, projectUrl, hidden, callback) {
		var projectObj = {
			name : projectName,
			description: projectDesc,
			url : projectUrl,
			hidden : hidden,
			slug : this.createProjectSlug(projectName),
			issueCounter : 0,
		}

		isSlugAvailable(projectObj.slug, function(avail) {
			if(avail) {
				DatabaseService.insert("projects", projectObj, callback);
			}
			else {
				callback("Project name is not available");
			}
		});
	},

	getProjects : function(callback) {
		DatabaseService.find("projects", {}, callback);
	},

	getProjectBySlug : function(slug, callback) {
		DatabaseService.findOne("projects", {slug : slug}, callback);
	},

	getAndIncProjectIssueCount : function(slug, callback) {
		DatabaseService.custom(function(db) {
			db.collection("projects").findAndModify({ slug : slug }, [], { $inc : { issueCounter : 1 } }, function(err, project) {
				if(err !== null) {
					winston.error(err, {time : Date.now()});
					callback(err);
					return;
				}

				callback(null, project.issueCounter);
			});
		});
	},

	createProjectSlug : function(fullProjectName) {
		return fullProjectName.toLowerCase().replace(" ", "_");
	}
}

exports.Projects = ProjectsService;
