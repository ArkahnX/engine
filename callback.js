var idCounter = 0;

function uniqueId(prefix) {
	var id = idCounter++;
	return prefix ? prefix + id : id;
};
var customEvent = function customEvent(name, permanent) {
	this.name = uniqueId()+name;
	this.permanent = permanent || this.permanent;

	window.document.addEventListener("customEvent-" + name, function(event) {
		event.detail.handler(event.detail.eventData);
	});
};
customEvent.prototype = {
	dispatch: function(eventDetails, handler) {
		var event = new window.CustomEvent("customEvent-" + this.name, {
			detail: {
				eventData: eventDetails,
				handler: handler
			}
		});
		window.document.dispatchEvent(event);
	},
	trigger: function(eventDetails) {
		this.details = eventDetails || {};
		this.triggered = true;
		for (var i = 0; i < this.handlers.length; i++) {
			this.dispatch(eventDetails, this.handlers[i]);
		}
	},
	listen: function(fn) {
		if (this.permanent && this.triggered) {
			this.dispatch(this.details, fn);
		} else {
			this.handlers.push(fn);
		}
	},
	handlers: [],
	details: null,
	permanent: false,
	triggered: false,
	name: ""
};

exports.create = function(name) {
	return new customEvent(name);
};