var path = require("path");
var root = path.dirname(global.require.main.filename);
var readwrite = require(path.resolve(root, "engine/readwrite.js"));

window.constants = {};

function setConstants(data) {
	console.log(data)
	window.constants = JSON.parse(data);
}

exports.set = function(name, value, remove) {
	if(name) {
		if(typeof name !== "string") {
			for(var attr in name) {
				var upperCaseName = attr.toLocaleUpperCase();
				if(!window.constants[upperCaseName] || remove) {
					window.constants[upperCaseName] = name[attr];
				}
			}
		} else {
			var upperCaseName = name.toLocaleUpperCase();
			if(!window.constants[upperCaseName] || remove) {
				window.constants[upperCaseName] = value;
			}
		}
		readwrite.save(JSON.stringify(window.constants),"constants");
	}
};

exports.get = function(name) {
	var upperCaseName = name.toLocaleUpperCase();
	if(!window.constants[upperCaseName]) {
		console.error("Constant '",upperCaseName,"' does not exist. Returned undefined.",window.constants)
	} else {
		return window.constants[upperCaseName];
	}
	return undefined;
};

exports.remove = function(name) {
	var upperCaseName = name.toLocaleUpperCase();
	if(!window.constants[upperCaseName]) {
		console.error("Constant '",upperCaseName,"' does not exist. Returned undefined.",window.constants)
	} else {
		delete window.constants[upperCaseName];
	}
	return undefined;
};

readwrite.load("constants",function() {
	exports.set({
		"loaded": true,
		"null":null,
		"false":false,
		"true":true,
		"empty_array":[],
		"empty_object":{}
	}, true);
});