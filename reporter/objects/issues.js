var database = require('../database.js');
var winston = require("winston");

function Projects() {

	function createProjectObj(projectObj, callback) {
		database.getDb(function(error, db) {
			db.collection("projects").insert(projectObj, function(err, inserted) {
				if(err !== null) {
					winston.error(error, {time : Date.now()});
					callback(err);
					return;
				}

				callback(null, inserted);
			});
		});
	}

	return {
		createProject : function(projectName, projectUrl, hidden, callback) {
			var projectObj = {
				name : projectName,
				url : projectUrl,
				hidden : hidden
			}

			createProjectObj(projectObj, callback);
		},

		getProjects : function(callback) {
			database.getDb(function(error, db) {
				db.collection("projects").find({}, function(err, cursor) {
					cursor.toArray(function(err, documents) {
						if(err !== null) {
							winston.error(error, {time : Date.now()});
							return;
						}

						callback(null, documents);
					});
				});
			});
		}
	}
}

function Issues() {

	var reqFields = ["name", "description", "issueType", "reporterId", "projectId"];

	function getMissingFields(obj) {
		var missingFields = [];

		for(field in reqFields) {
			if(!field in obj) {
				missingFields.push(field);
			}
		}

		return missingFields;
	} 

	return {
		createIssue : function(issueObj, callback) {
			var missingFields = getMissingFields(issueObj);

			if(missingFields.length === 0) {

				issueObj.createDate = Date.now();
				issueObj.modifiedDate = Date.now();
				issueObj.votes = 0;

				database.getDb(function(error, db) {
					db.collection("issues").insert(issueObj, function(err, inserted) {
						if(err !== null) {
							winston.error(error, {time : Date.now()});
							callback(err);
							return;
						}

						callback(null, inserted);
					});
				});
			}
			else {
				callback("Got missing fields: " + getMissingFields.toString());
			}
		},
		
		getIssues : function(callback) {
			database.getDb(function(error, db) {
				db.collection("issues").find({}, function(err, cursor) {

					cursor.toArray(function(err, documents) {
						if(err !== null) {
							winston.error(error, {time : Date.now()});
							return;
						}

						callback(null, documents);
					});
				});
			});
		}
	}
}

exports.Issues = Issues;
exports.Projects = Projects;