var ReporterMongoServer = require('./database.js');

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
		
		createIssue : function(issueObj, successCallback, errorCallback) {
			ReporterMongoServer.client.open(function(err, mClient) {
				var db = mClient.db("issue_db");
				
				db.collection("issues").insert(issueObj, function(err, inserted) {
					if(err !== null) {
						console.log("Error creating issue: " + err);
						errorCallback();
						return;
					}

					successCallback();

					mClient.close();
				});
			});
		},
		
		getIssues : function(callback) {
			var list = [];
			
			ReporterMongoServer.client.open(function(err, mClient) {
				var db = mClient.db("issue_db");

				db.collection("issues").find({}, function(err, cursor) {

					cursor.toArray(function(err, documents) {
						if(err !== null) {
							console.log(err);
							return;
						}

						callback(documents);

						mClient.close();
					});
				});
			});
		}
	}
}

exports.Issues = Issues;
