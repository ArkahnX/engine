// prevent the default node-webkit error handler first thing.
process.on("uncaughtException", function(err) {
	console.error(err.message, err.stack);
});

// set a shortcut function for global.require
var path = global.require("path");
var root = path.dirname(global.require.main.filename);
window.nodeRequire = global.nodeRequire = function(file) {
	return global.require(path.resolve(root, file));
};

var meter = new FPSMeter({
	interval: 60, // Update interval in milliseconds.
	smoothing: 10, // Spike smoothing strength. 1 means no smoothing.
	show: 'fps', // Whether to show 'fps', or 'ms' = frame duration in milliseconds.
	toggleOn: 'click', // Toggle between show 'fps' and 'ms' on this event.
	decimals: 1, // Number of decimals in FPS number. 1 = 59.9, 2 = 59.94, ...
	maxFps: 60, // Max expected FPS value.
	threshold: 50, // Minimal tick reporting interval in milliseconds.

	// Meter position
	position: 'absolute', // Meter position.
	zIndex: 10, // Meter Z index.
	left: '5px', // Meter left offset.
	top: 'auto', // Meter top offset.
	right: 'auto', // Meter right offset.
	bottom: '5px', // Meter bottom offset.
	margin: '0 0 0 0', // Meter margin. Helps with centering the counter when left: 50%;

	// Theme
	theme: 'colorful', // Meter theme. Build in: 'dark', 'light', 'transparent', 'colorful'.
	heat: 1, // Allow themes to use coloring by FPS heat. 0 FPS = red, maxFps = green.

	// Graph
	graph: 1, // Whether to show history graph.
	history: 20 // How many history states to show in a graph.
});

// var CONST = nodeRequire("engine/constants.js");
var extensions = nodeRequire("engine/extensions.js");

//define the node require function here for use in window and global.


console.time('assetLoaders');
extensions.loadMods();