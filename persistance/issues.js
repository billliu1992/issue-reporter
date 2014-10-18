var MongoClient = require("mongodb").MongoClient
var Server = require("mongodb").Server;

var IssuesDAO = function() {
	var server = new Server('localhost', 27017);
	this.client = new MongoClient(server);
};

IssuesDAO.prototype = {
	/* 
	 */
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
			
			db.issues.insert(issueObj);
			
			mClient.close();
		});
	},
	
	getIssues : function(issueObj) {
		var list = [];
		
		this.client.open(function(err, mClient) {
			var db = mClient.db("issue_db");
			var cursor = db.collection("issues").find();
			
			cursor.toArray(function(err, documents) {
				list = documents;
			});
			
			mClient.close();
		});
		
		return list;
	}
}

exports.IssuesDAO = IssuesDAO;
