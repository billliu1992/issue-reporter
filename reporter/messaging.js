var Message = function() {
	this.messages = [];
}

Message.prototype = {
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

		return this.messages
	}
}

exports.Message = Message;