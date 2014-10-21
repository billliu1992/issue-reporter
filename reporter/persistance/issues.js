var MongoClient = require("mongodb").MongoClient
var Server = require("mongodb").Server;

var IssuesDAO = function() {
	var server = new Server('localhost', 27017);	/* Change later */
	this.client = new MongoClient(server);
};

IssuesDAO.prototype = {
	/* 
	 */

	DATABASE_NAME : "issue_db",
	
	createNewIssueQuick : function(title, body, type, priority, createDate, modifiedDate, reporter, assignee, internal) {
		var newObj = createIssueObject(title, body, type, priority, createDate, modifiedDate, reporter, assignee, internal);
	},
	
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
	
	createIssue : function(issueObj) {
		this.client.open(function(err, mClient) {
			var db = mClient.db("issue_db");
			
			db.collection("issues").insert(issueObj, function(err, inserted) {
				if(err !== null) {
					console.log(err);
					return;
				}

				mClient.close();
			});
		});
	},
	
	getIssues : function(callback) {
		var list = [];
		
		this.client.open(function(err, mClient) {
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

exports.IssuesDAO = IssuesDAO;
