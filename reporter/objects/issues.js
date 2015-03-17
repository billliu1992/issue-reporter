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
				slug : this.createProjectSlug(projectName),
				issueCounter : 0,
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

		getAndIncProjectIssueCount : function(slug, callback) {
			database.getDb(function(error, db) {
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
}

function IssuesService() {

	var reqFields = ["name", "description", "issueType", "reporter", "projectSlug"];

	function isValidIssueObj(obj) {
		for(fieldIndex in reqFields) {
			if(!(reqFields[fieldIndex] in obj)) {
				return false;
			}
		}

		return true;
	} 

	return {
		createIssue : function(issueObj, projectSlug, callback) {
			Projects.getAndIncProjectIssueCount(projectSlug, function(err, count) {
				if(isValidIssueObj(issueObj)) {
					issueObj.createDate = Date.now();
					issueObj.modifiedDate = Date.now();
					issueObj.votes = 0;
					issueObj.issueNum = count;

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
					callback("Got missing fields");
				}
			});
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

		getIssuesOfProject : function(projectSlug, callback) {

			database.getDb(function(error, db) {
				db.collection("issues").find({projectSlug : projectSlug}, function(err, cursor) {
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

		getIssue : function(issueId, callback) {
			database.getDb(function(error, db) {
				db.collection("issues").find({_id : issueId}, function(err, cursor) {
					cursor.nextObject(function(err, issue) {
						if(err !== null) {
							winston.error(error, {time : Date.now()});
							return;
						}

						callback(null, issue);
					});
				});
			});
		},

		getIssueByProjectAndNumber : function(projectSlug, issueNum, callback) {
			database.getDb(function(error, db) {
				db.collection("issues").find({ projectSlug : projectSlug, issueNum : issueNum }, function(err, cursor) {
					cursor.nextObject(function(err, issue) {
						if(err !== null) {
							winston.error(err, {time : Date.now()});
							callback(err);
							return;
						}
						if(issue === null) {
							winston.error("Could not find issue #" + issueNum + " in slug: " + projectSlug);
							callback("Could not find issue #" + issueNum + " in slug: " + projectSlug);
							return;
						}

						callback(null, issue);
					});
				});
			});
		},

		updateIssue : function(issueObj, projectSlug, issueNum, callback) {
			if(isValidIssueObj(issueObj)) {
				database.getDb(function(error, db) {
					db.collection("issues").update({ projectSlug : projectSlug, issueNum : issueNum }, { $set : issueObj }, function(err, count, status) {
						if(err) {
							callback(err);
							winston.error(err, {time : Date.now() });
							return;
						}

						callback(null, count, status);
					});
				});
			}
			else {
				callback("Not enough fields");
			}
		}
	}
}

Projects = new ProjectsService();
Issues = new IssuesService();

exports.Issues = Issues;
exports.Projects = Projects;