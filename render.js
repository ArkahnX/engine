var path = require("path");
var root = path.dirname(global.require.main.filename);
var CONST = require(path.resolve(root, "engine/constants.js"));
var Event = require(path.resolve(root, "engine/event.js")).Event;
exports.event = new Event(["drawMode", "frame", "ready"]);

exports.event.listen("drawMode", function(event) {
	if (event.name && event.size) {
		CONST.set(event.name, event.size);
	}
});

var layers = [];
var layerNames = [];
var tileSheets = [];
var images = [];
var domRoot = null;
var gameRoot = null;
var que = {};
var domReady = false;
var processingQue = false;
var reProcess = false;
var animationLoop;
var document;
var contexts = [];
var currentContext;
var loop = false;
var buffer, bufferContext;

exports.appendGameDOM = function(name, id, optionalParent) {
	var node = makeNode(name, id);
	addToQue(optionalParent || "root", node, "game");
};

exports.buffer = function(callback) {
	callback(bufferContext)
};

function newImage(tilesheet, callback) {
	var index = tileSheets.indexOf(tilesheet);
	if (index > -1 && images[index] !== null) {
		return callback(images[index]);
	}
	tileSheets.push(tilesheet);
	var image = new window.Image();
	image.onload = function() {
		var index = tileSheets.indexOf(image.getAttribute("data-src"));
		images[index] = this;
		callback(this);
	};
	image.src = tilesheet;
	image.setAttribute("src", tilesheet);
	image.setAttribute("data-src", tilesheet);
	images.push(null);
}

function makeLayer(name) {
	layerNames.push(name);
	layers.push(null);
	contexts.push(null);
	return layers.length;
}

function getContext(index) {
	if (contexts[index] === null) {
		var canvas = layers[index];
		contexts[index] = canvas.getContext("2d");
	}
	currentContext = contexts[index];
	currentContext.clearRect(0, 0, 1312, 400);
}

exports.pickLayer = function(name) {
	var index = layerNames.indexOf(name);
	return getContext(index);
}

exports.readyTileset = function(tileSet, callback) {
	newImage(tileSet, callback);
}

exports.setBufferSize = function(width, height) {
	buffer.width = width;
	buffer.height = height;
};

exports.isReady = function(fn) {
	if (domReady) {
		fn();
	} else {
		exports.event.listen("ready", fn);
	}
};

exports.draw = function(tilesheet, startx, starty, startw, starth, drawx, drawy, draww, drawh) {
	var index = tileSheets.indexOf(tilesheet);
	var image = images[index];
	currentContext.drawImage(image, startx, starty, startw, starth, drawx, drawy, draww, drawh);
	// newImage(tilesheet, function(image) {
	// console.log(drawx)
	// currentContext.font = "12px sans-serif";
	// currentContext.textBaseline = "top";
	// currentContext.fillText(drawx/16+","+drawy/16, drawx, drawy);
	// });
};

exports.drawFromBuffer = function(startX, startY, drawX, drawY, width, height) {
	if (!currentContext) {
		getContext(0);
	}
	currentContext.drawImage(buffer, startX, startY, width, height, drawX, drawY, width, height);
};

exports.drawBuffer = function(tilesheet, startx, starty, startw, starth, drawx, drawy, draww, drawh) {
	var index = tileSheets.indexOf(tilesheet);
	var image = images[index];
	// console.log(drawx,drawy)
	bufferContext.drawImage(image, startx, starty, startw, starth, drawx, drawy, draww, drawh);
	// newImage(tilesheet, function(image) {
	// console.log(drawx)
	// currentContext.font = "12px sans-serif";
	// currentContext.textBaseline = "top";
	// currentContext.fillText(drawx/16+","+drawy/16, drawx, drawy);
	// });
};

exports.createLayer = function(name, width, height) {
	if (layerNames.indexOf(name) === -1) {
		var id = makeLayer(name);
		var canvas = makeNode("canvas", name, width, height);
		addToQue("canvasHolder", canvas, "engine");
	}
};



exports.onDraw = function(id, fn) {
	fns[id] = fn;
}

exports.removeOnDraw = function(id) {
	delete fns[id];
}

var fns = {};

function animate() {
	if (!loop) {
		return false;
	}
	if (currentContext) {
		currentContext.clearRect(0, 0, 1312, 400);
	}
	for (var attr in fns) {
		fns[attr](currentContext);
	}
	window.meter.tick();
	window.requestAnimationFrame(animate);
}


exports.runLoop = function() {
	if (loop === false) {
		loop = true;
		animationLoop = window.requestAnimationFrame(animate);
	}
};
exports.stopLoop = function() {
	loop = false;
	window.cancelAnimationFrame(animationLoop);
	window.webkitCancelRequestAnimationFrame(animationLoop);
	window.webkitCancelAnimationFrame(animationLoop);
};

function makeNode(nodeName, nodeId, width, height) {
	var node = document.createElement(nodeName);
	node.setAttribute("id", nodeId);
	if (width && height) {
		node.setAttribute("width", width);
		node.setAttribute("height", height);
	}
	return node;
}

function addToQue(name, item, root) {
	if (!que[name]) {
		que[name] = document.createDocumentFragment();
	}
	que[name].appendChild(item);
	processQue(root);
}

function processQue(root) {
	if (processingQue) {
		return reProcess = true;
	}
	if (domReady) {
		reProcess = false;
		processingQue = true;
		for (var attr in que) {
			if (!document.getElementById(attr)) {
				if (root === "game") {
					gameRoot.appendChild(makeNode("div", attr));
				} else {
					domRoot.appendChild(makeNode("div", attr));
				}
			}
			document.getElementById(attr).appendChild(que[attr]);
			delete que[attr];
		}
		for (var i = 0; i < layers.length; i++) {
			if (layers[i] === null) {
				layers[i] = document.getElementById(layerNames[i]);
			}
		}
		processingQue = false;
	}
	if (reProcess) {
		return processQue();
	}
	// console.log(layers)
	return false;
}

/*!
 * contentloaded.js
 *
 * Author: Diego Perini (diego.perini at gmail.com)
 * Summary: cross-browser wrapper for DOMContentLoaded
 * Updated: 20101020
 * License: MIT
 * Version: 1.2
 *
 * URL:
 * http://javascript.nwbox.com/ContentLoaded/
 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
 *
 */

// @win window reference
// @fn function reference

function contentLoaded(win, fn) {

	var done = false,
		top = true,

		doc = win.document,
		root = doc.documentElement,

		add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
		rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
		pre = doc.addEventListener ? '' : 'on',

		init = function(e) {
			if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
			(e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
			if (!done && (done = true)) fn.call(win, e.type || e);
		},

		poll = function() {
			try {
				root.doScroll('left');
			} catch (e) {
				setTimeout(poll, 50);
				return;
			}
			init('poll');
		};

	if (doc.readyState == 'complete') fn.call(win, 'lazy');
	else {
		if (doc.createEventObject && root.doScroll) {
			try {
				top = !win.frameElement;
			} catch (e) {}
			if (top) poll();
		}
		doc[add](pre + 'DOMContentLoaded', init, false);
		doc[add](pre + 'readystatechange', init, false);
		win[add](pre + 'load', init, false);
	}

}

contentLoaded(window, function() {
	document = window.document;
	domRoot = document.getElementById("engine");
	domRoot.innerHTML = "";
	gameRoot = document.getElementById("game");
	gameRoot.innerHTML = "";
	buffer = document.createElement("canvas");
	bufferContext = buffer.getContext("2d");
	domReady = true;
	exports.event.triggerPermanent("ready");
	processQue();
});