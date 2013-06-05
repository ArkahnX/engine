var path = require("path");
var root = path.dirname(global.require.main.filename);
var readwrite = require(path.resolve(root, "engine/readwrite.js"));

window._constants = {};

function setConstants(data) {
	console.log(data)
	window._constants = JSON.parse(data);
}

exports.set = function(name, value, remove) {
	if(name) {
		if(typeof name !== "string") {
			for(var attr in name) {
				var upperCaseName = attr.toLocaleUpperCase();
				if(!window._constants[upperCaseName] || remove) {
					window._constants[upperCaseName] = name[attr];
				}
			}
		} else {
			var upperCaseName = name.toLocaleUpperCase();
			if(!window._constants[upperCaseName] || remove) {
				window._constants[upperCaseName] = value;
			}
		}
		readwrite.save(JSON.stringify(window._constants),"constants");
	}
};

exports.get = function(name) {
	var upperCaseName = name.toLocaleUpperCase();
	if(typeof window._constants[upperCaseName] === "undefined") {
		console.error("Constant '",upperCaseName,"' does not exist. Returned undefined.",window._constants)
	} else {
		return window._constants[upperCaseName];
	}
	return undefined;
};

exports.remove = function(name) {
	var upperCaseName = name.toLocaleUpperCase();
	if(!window._constants[upperCaseName]) {
		console.error("Constant '",upperCaseName,"' does not exist. Returned undefined.",window._constants)
	} else {
		delete window._constants[upperCaseName];
	}
	return undefined;
};

readwrite.load("constants",function() {
	exports.set({
		"loaded": true,
		"null":null,
		"zero":0,
		"false":false,
		"true":true,
		"empty_array":[],
		"empty_object":{}
	}, true);
});