var database = require('../database.js');
var winston = require("winston");

function Issues() {

	return {
		createIssueObject : function(title, body, type, priority, createDate, modifiedDate, reporter, assignee, internal) {
			return {
				"title" : title, 
				"body" : body,
				"type" : type,
				"priority" : priority,
				"create_date" : createDate,
				"modified_date" : modifedDate,
				"reporter" : reporter,
				"assignee" : assignee,
				"internal" : internal,
				"votes" : 0
			}
		},
		
		createIssue : function(issueObj, callback) {
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
		},
		
		getIssues : function(callback) {
			database.getDb(function(error, db) {
				db.collection("issues").find({}, function(err, cursor) {

					cursor.toArray(function(err, documents) {
						if(err !== null) {
							winston.error(error, {time : Date.now()});
							return;
						}

						callback(documents);
					});
				});
			});
		}
	}
}

exports.Issues = Issues;
