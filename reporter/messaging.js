var MessageService = function() {
	this.messages = [];
}

MessageService.prototype = {
	ERROR : "message-error",
	SUCCESS : "message-success",
	hasMessages : function() {
		return this.messages.length != 0;
	},

	addMessage : function(message, type) {
		this.messages.push({
			"message" : message,
			"type" : type});
	},

	getMessage : function() {
		return this.messages.pop();
	},

	getAllMessages : function() {
		allMessages = this.messages;
		this.messages = [];

		return allMessages
	}
}

exports.Message = new MessageService();