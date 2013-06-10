// deprecated

var path = require("path");
var root = path.dirname(global.require.main.filename);
var config = require(path.resolve(root, "engine/config.js"));
var CONST = require(path.resolve(root, "engine/constants.js"));
var Event = require(path.resolve(root, "engine/event.js")).Event;
exports.event = new Event(["parseMapChunk", "getMapTile", "modifyTile"], ["registerMapConverter"]);
var Callback = require(path.resolve(root, "engine/callback.js"));
exports.parse

var mapCache = {};

var centerX = 0;
var centerY = 0;


var parseMapChunk, getMapTile, modifyTile, getMap;

exports.setup = function(mapName) {
	getMap(mapName);
	config.getConfigValue("system", "windowWidth", function(windowWidth) {
		config.getConfigValue("system", "windowHeight", function(windowHeight) {
			var halfWidth = windowWidth/2;
			var halfHeight = windowHeight/2;
			mapCache = parseMapChunk(centerX -halfWidth, centerY - halfHeight, centerX + halfWidth, centerY + halfHeight, 16, mapCache);
		})
	})
};

exports.registerMapConverter = function(parseMapChunk, getMapTile, modifyTile, getMap) {
	parseMapChunk = parseMapChunk;
	getMapTile = getMapTile;
	modifyTile = modifyTile;
	getMap = getMap;
};

exports.modifyTile = function() {

};

exports.sendMapChunk = function() {

};

exports.sendMapTile = function() {

};

exports.setOrigin = function(x, y) {
	centerX = x;
	centerY = y;
};