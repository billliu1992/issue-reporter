var database = require('../database.js');
var winston = require("winston");

function ProjectsService() {

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

	function isSlugAvailable(potentialSlug, callback) {
		database.getDb(function(error, db) {
			db.collection("projects").find({slug : potentialSlug}, function(err, cursor) {
				cursor.nextObject(function(err, doc) {
					if(err !== null) {
						winston.error(error, {time : Date.now()});
						callback(err);
						return;
					}
					
					callback(doc === null);
				});
			});
		});
	}

	return {
		createProject : function(projectName, projectDesc, projectUrl, hidden, callback) {
			var projectObj = {
				name : projectName,
				description: projectDesc,
				url : projectUrl,
				hidden : hidden,
				slug : this.createProjectSlug(projectName)
			}

			isSlugAvailable(projectObj.slug, function(avail) {
				if(avail) {
					createProjectObj(projectObj, callback);
				}
				else {
					callback("Project name is not available");
				}
			});
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
		},

		getProjectBySlug : function(slug, callback) {
			database.getDb(function(error, db) {
				db.collection("projects").find({slug : slug}, function(err, cursor) {
					cursor.nextObject(function(err, doc) {
						if(err !== null) {
							winston.error(error, {time : Date.now()});
							callback(err);
							return;
						}
						else if(doc == null) {
							winston.error("Did not get project with slug: " + slug, {time : Date.now()});
							callback("Did not get project with slug: " + slug);
							return;
						}

						callback(null, doc);
					});
				});
			});
		},

		createProjectSlug : function(fullProjectName) {
			return fullProjectName.toLowerCase().replace(" ", "_");
		}
	}
}

function IssuesService() {

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
		
		getIssues : function(callback, limitNumber) {
			database.getDb(function(error, db) {
				db.collection("issues").find({}, function(err, cursor) {

					if(limitNumber) {
						cursor.limit(limitNumber);
					}

					cursor.toArray(function(err, documents) {
						if(err !== null) {
							winston.error(error, {time : Date.now()});
							return;
						}

						callback(null, documents);
					});
				});
			});
		},

		getIssuesOfProject : function(projectId, callback) {

			database.getDb(function(error, db) {
				db.collection("issues").find({projectId : projectId}, function(err, cursor) {
					cursor.toArray(function(err, documents) {
						if(err !== null) {
							winston.error(error, {time : Date.now()});
							return;
						}

						console.log(documents.length);

						callback(null, documents);
					});
				});
			});
		}
	}
}

exports.Issues = new IssuesService();
exports.Projects = new ProjectsService();