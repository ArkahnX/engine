var path = require("path");
var root = path.dirname(global.require.main.filename);
var readwrite = require(path.resolve(root, "engine/readwrite.js"));
var Event = require(path.resolve(root, "engine/event.js")).Event;
exports.event = new Event(["valueChanged"]);

var configuration = {};

exports.getConfig = function(config, callback, error) {
	if (!error) {
		error = exports.defaultConfigError;
	}
	if (configuration[config]) {
		callback(configuration[config]);
	} else {
		readwrite.load("config-" + config, function(data) {
			configuration[config] = JSON.parse(data);
			callback(configuration[config]);
		}, function(err) {
			error(config, err);
		});
	}
};

exports.defaultValueError = function(err) {
	console.error("An error occured trying to fetch ", err, ". It probably doesn't exist.")
};
exports.defaultConfigError = function(name, err) {
	console.error("The following error was found when trying to get ", name, ": ", err)
};

exports.getConfigValue = function(config, name, callback, error) {
	if (!error) {
		error = exports.defaultValueError;
	}
	exports.getConfig(config, function(data) {
		if (data[name]) {
			callback(data[name]);
		} else {
			error(name);
		}
	}, exports.defaultConfigError);
};

exports.create = function(defaultData, name, callback) {
	if (typeof name === "function") {
		callback = name;
		name = defaultData;
		defaultData = {};
	}
	readwrite.save(JSON.stringify(defaultData), "config-" + name, callback);
};

exports.setValue = function(config, name, value, callback) {
	exports.getConfig(config, function(data) {
		exports.event.trigger("valueChanged",exports,{
			oldValue:config[name],
			newValue:value,
			valueName:name
		});
		config[name] = value;
	});
};