var bcrypt = require("bcryptjs");
var winston = require("winston");
var Database = require('../database').DatabaseService;
var Users = require("./users").Users

var RolesService = {
		createRole : function(name, projectId, callback) {
			var roleObj = {
				name : name,
				permissions : [],
				projectId : projectId
			}

			DatabaseService.insert("roles", roleObj, callback);
		},

		getProjectRolesByUserId : function(userId, projectId, callback) {
			Users.getUserById(userId, function(err, userObj) {
				if(error) {
					callback(error);
					return;
				}

				DatabaseService.find("roles", { $in : userObj.roles }, project : projectId }, callback);
			});
		},

		checkUserPermission : function(userObj, projectId, permission, callback) {
			RolesService.getRolesByUserId(userObj._id, projectId, function(err, roles) {
				if(err !== null) {
					callback(err);
					return;
				}

				for(role in roles) {
					if(permission in role.permissions) {
						callback(null, true);
					}
				}

				callback(null, false);
			});
		},

		addPermission : function(name, projectId, permission, callback) {
			DatabaseService.update("roles", 
				{ name : name, projectId : projectId }, 
				{ $push : { permissions : permission } },
				callback);
		},

		removePermission : function(name, projectId, permission, callback) {
			DatabaseService.update("roles",
				{ name : name, projectId : projectId },
				{ $pull : { permissions : permission } },
				callback);
		}
	}
}

exports.Roles = RolesService;
