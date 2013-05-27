//array of event names
var Event = function(standardEvents, singleUseEvents) {
	var Listener = function(name, singleUse) {
		return {
			name: name,
			singleUse: singleUse,
			triggered: false,
			callbacks: []
		};
	};
	var listeners = [];
	if (standardEvents.length) {
		for (var i = 0; i < standardEvents.length; i++) {
			listeners.push(Listener(standardEvents[i], false));
		}
	}
	if (singleUseEvents && singleUseEvents.length) {
		for (var i = 0; i < singleUseEvents.length; i++) {
			listeners.push(Listener(singleUseEvents[i], true));
		}
	}
	this.listeners = listeners;
	this.indexes = standardEvents.concat(singleUseEvents);
	this.listen = function(type, callback) {
		console.log("Set listener for ", type);
		var index = this.indexes.indexOf(type);
		if (index === -1) {
			return false;
		}
		var listener = this.listeners[index];
		if (listener.singleUse) {
			listener.callbacks[0] = callback;
		} else {
			listener.callbacks.push(callback);
		}
		if (listener.triggered) {
			this.trigger(type);
		}
		return listener.callbacks.length - 1;
	};
	this.trigger = function(type, self, eventData) {
		var index = this.indexes.indexOf(type);
		if (index > -1) {
			var listener = this.listeners[index];
			if (listener.triggered === false) {
				console.log("Fired trigger for ", type, listener);
			}
			var length = listener.callbacks.length;
			if (length) {
				for (var i = 0; i < length; i++) {
					listener.callbacks[i](self, eventData);
				}
				return true;
			}
		}
		return false;
	};
	this.triggerPermanent = function(type) {
		var index = this.indexes.indexOf(type);
		if (index > -1) {
			var listener = this.listeners[index];
			if (listener.triggered === false) {
				console.log("Trigger ", type, " is permanently set.");

				listener.triggered = true;
				var length = listener.callbacks.length;
				if (length) {
					for (var i = 0; i < length; i++) {
						listener.callbacks[i]();
					}
					return true;
				}
			}
		}
		return false;
	};
	this.remove = function(type, id) {
		var index = this.indexes.indexOf(type);
		var listener = this.listeners[index];
		listener.callbacks.splice(id, 1);
	};
	return this;
};
exports.Event = Event;


// See Also: https://docs.google.com/document/d/1Btt-T8jCU9nYhZJncbU3E6rsFV2TDWPlGFQ9XAv4c8g