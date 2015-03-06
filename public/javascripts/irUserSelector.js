(function() {

	/* settings variables */
	var classNamePrefix = "ir-user-selector";
	HtmlClassNames = {
		userQueryInput : classNamePrefix + "-query-input",
		userSelectedText : classNamePrefix + "-selected-user",
		userSelectorBox : classNamePrefix + "-user-selector-box",
		shownSelectorBox : classNamePrefix + "-box-show",
		hiddenSelectorBox : classNamePrefix + "-box-hide",
		userEntry : classNamePrefix + "-user-entry"
	};
	var ajaxUrl = "/user/query/";
	var maxListSize = 5;
	var updateDelayMSecs = 800;

	/* Interacts with website to bring lists of users
	*/
	var UserService = {
		getUserList : function(query, callback) {
			$.get(ajaxUrl, 
				{
					query : query
				},
				function(data) {
					callback(data);
				},
				"json"
			)
		}
	}

	UserSelector = function() {

		var userSelectorDom = document.getElementById("ir-user-selector");
		userSelectorDom.className = "unselected";

		// Create the DOM objects for the user selector
		var queryInput = document.createElement("input");
		queryInput.className = HtmlClassNames.userQueryInput;
		queryInput.type = "text";
		queryInput.placeholder = "Start typing a name here";
		userSelectorDom.appendChild(queryInput);

		var selectedSpan = document.createElement("span");
		selectedSpan.className = HtmlClassNames.userSelectedText;
		userSelectorDom.appendChild(selectedSpan);

		var userIdInput = document.createElement("input");
		userIdInput.name = "ir-user-selected-id";

		var selectorBox = document.createElement("div");
		selectorBox.className = HtmlClassNames.userSelectorBox;
		userSelectorDom.appendChild(selectorBox);

		var selectorObj = {
			selectedUser : null,
			updateLock : false,
			handleQuery : function() {
				var query = queryInput.value;

				if("" === query) {
					selectorBox.className = HtmlClassNames.userSelectorBox + " " + HtmlClassNames.hiddenSelectorBox;
				}
				else {
					selectorBox.className = HtmlClassNames.userSelectorBox + " " + HtmlClassNames.shownSelectorBox;

					var that = this;

					UserService.getUserList(query, function(usersList) {
						selectorBox.innerHTML = "";
						for(var i = 0; i < Math.min(usersList.length, 5); i++) {
							var userObj = usersList[i];

							var newUserEntry = document.createElement("div");
							newUserEntry.className = HtmlClassNames.userEntry;
							selectorBox.appendChild(newUserEntry);

							var newUserName = document.createElement("span");
							newUserName.className = HtmlClassNames.userEntry + "-name";
							newUserName.innerHTML = userObj.firstName + " " + userObj.lastName;
							newUserName.text = userObj.firstName + " " + userObj.lastName;
							newUserEntry.appendChild(newUserName);

							newUserEntry.addEventListener("click", function() {
								userIdInput.value = userObj.id;
								that.selectedUser = userObj;
								userSelectorDom.className = "selected";
								selectedSpan.innerHTML = userObj.firstName + " " + userObj.lastName;
							});
						}
					});
				}
			},
			delayedHandleQuery : function() {
				if(selectorObj.updateLock) {
					return;
				}
				else {
					selectorObj.updateLock = true;
					setTimeout(function() {
						selectorObj.handleQuery();
						selectorObj.updateLock = false;
					}, updateDelayMSecs);
				}
			},
			reselectUser : function() {
				userSelectorDom.className = "unselected";
				queryInput.value = selectedSpan.innerHTML;
				this.handleQuery;
				queryInput.focus();
			}
		}

		queryInput.addEventListener("keydown", selectorObj.delayedHandleQuery);
		queryInput.addEventListener("keyup", selectorObj.delayedHandleQuery);
		queryInput.addEventListener("keypress", selectorObj.delayedHandleQuery);
		selectedSpan.addEventListener("click", selectorObj.reselectUser);

		return selectorObj;
	};

})();