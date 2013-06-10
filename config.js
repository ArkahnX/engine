var path = require("path");
var root = path.dirname(global.require.main.filename);
var readwrite = require(path.resolve(root, "engine/readwrite.js"));
var Callback = require(path.resolve(root, "engine/callback.js"));
exports.onValueChanged = Callback.create("onValueChanged");

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

function Values(old,newVal,name) {
	this.oldValue = old;
	this.newValue = newVal;
	this.valueName = name;
};

exports.setValue = function(config, name, value, callback) {
	exports.getConfig(config, function(data) {
		exports.onValueChanged.trigger(new Values(config[name],value,name));
		config[name] = value;
	});
};