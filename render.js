var path = require("path");
var root = path.dirname(global.require.main.filename);
var CONST = require(path.resolve(root, "engine/constants.js"));
var Callback = require(path.resolve(root, "engine/callback.js"));
exports.onDrawMode = Callback.create("onDrawMode");
exports.onFrame = Callback.create("onFrame");
exports.onReady = Callback.create("onReady",true);

exports.onDrawMode.listen(function(event) {
	if (event.name && event.size) {
		CONST.set(event.name, event.size);
	}
});

var PIXI = window.PIXI;

var stages = [];
var renderers = [];
var domRoot = null;
var gameRoot = null;
var que = {};
var domReady = false;
var processingQue = false;
var reProcess = false;
var animationLoop;
var document;
var currentContext;
var textures = {};
var sprites = {};
var views = {
	layerNames: [],
	renderers: [],
	stages: []
};
var buffers = {
	size: {
		width: 0,
		height: 0
	},
	layerNames: [],
	renderers: [],
	stages: []
};
var current = {
	view: {
		stage: null,
		renderer: null
	},
	buffer: {
		stage: null,
		renderer: null
	}
};
var loop = false;
var buffer, bufferContext;


// adds an element to the screen.
exports.appendGameDOM = function(name, id, optionalParent) {
	var node = makeNode(name, id);
	addToQue(optionalParent || "root", node, "game");
};

function getView(index) {
	current.view.stage = views.stages[index];
	current.buffer.stage = buffers.stages[index];
	current.view.renderer = views.renderers[index];
	current.buffer.renderer = buffers.renderers[index];
}

exports.pickLayer = function(name) {
	var index = views.layerNames.indexOf(name);
	return getView(index);
}

exports.readyTileset = function(tileSet, callback) {
	if (PIXI.Texture.fromImage(tileSet).baseTexture.hasLoaded) {
		callback();
	} else {
		var loader = new PIXI.AssetLoader([tileSet]);
		loader.onComplete = callback;
		loader.load();
	}
}

exports.setBufferSize = function(width, height) {
	buffers.size.width = width;
	buffers.size.height = height;
	for (var i = 0; i < buffers.renderers.length; i++) {
		buffers.renderers[i].resize(width, height);
	}
};

exports.isReady = function(fn) {
	exports.onReady.listen(fn);
};

exports.baseTexture = function(tileSheet) {
	if (!textures[tileSheet]) {
		textures[tileSheet] = PIXI.Texture.fromImage(tileSheet).baseTexture;
	}
	return textures[tileSheet];
};

exports.texture = function(tileSheet, x, y, width, height) {
	var name = tileSheet + "-" + x + "-" + y + "-" + width + "-" + height;
	if (!sprites[name]) {
		sprites[name] = new PIXI.Texture(exports.baseTexture(tileSheet), new PIXI.Rectangle(x, y, width, height));
	}
	return sprites[name];
};

exports.draw = function(tileSheet, startX, startY, startW, startH, drawX, drawY, drawW, drawH) {
	if (!current.buffer.stage) {
		getView(0);
	}
	if (typeof tileSheet === "string") {
		var texture = new PIXI.Texture(exports.baseTexture(tileSheet), new PIXI.Rectangle(startX, startY, startW, startH));
	} else {
		var texture = tileSheet;
	}
	var sprite = new PIXI.Sprite(texture);

	sprite.position.x = drawX;
	sprite.position.y = drawY;
	sprite.width = drawW;
	sprite.height = drawH;
	current.view.stage.addChild(sprite);
};

exports.drawFromBuffer = function(startX, startY, drawX, drawY, width, height) {
	if (!current.buffer.stage) {
		getView(0);
	}
	var texture = PIXI.Texture.fromCanvas(current.buffer.renderer.view);
	//fixme
	console.log(views, buffers, current)
	texture.setFrame(new PIXI.Rectangle(startX, startY, width, height));
	var sprite = new PIXI.Sprite(texture);

	sprite.position.x = drawX;
	sprite.position.y = drawY;
	sprite.width = width;
	sprite.height = height;
	current.view.stage.addChild(sprite);
};

exports.drawBuffer = function(tileSheet, startX, startY, startW, startH, drawX, drawY, drawW, drawH) {
	if (!current.buffer.stage) {
		getView(0);
	}
	if (typeof tileSheet === "string") {
		var texture = new PIXI.Texture(exports.baseTexture(tileSheet), new PIXI.Rectangle(startX, startY, startW, startH));
	} else {
		var texture = tileSheet;
	}
	var sprite = new PIXI.Sprite(texture);

	sprite.position.x = drawX;
	sprite.position.y = drawY;
	sprite.width = drawW;
	sprite.height = drawH;
	// console.log(sprite, texture)
	current.buffer.stage.addChild(sprite);
};



exports.createLayer = function(name, width, height) {
	if (views.layerNames.indexOf(name) === -1) {
		var id = views.layerNames.length;
		buffers.layerNames.push(name);
		views.layerNames.push(name);
		buffers.stages.push(new PIXI.Stage(0xFFFFFF));
		views.stages.push(new PIXI.Stage(0xFFFFFF));
		buffers.renderers.push(PIXI.autoDetectRenderer(buffers.size.width, buffers.size.height));
		views.renderers.push(PIXI.autoDetectRenderer(width, height));

		addToQue("canvasHolder", views.renderers[id].view, "engine");
		// addToQue("canvasHolder", buffers.renderers[id].view, "hidden");
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
	for (var attr in fns) {
		fns[attr](current);
	}
	for (var i = 0; i < views.stages.length; i++) {
		views.renderers[i].render(views.stages[i]);
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
			if (!done && (done = true)) fn();
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

	if (doc.readyState == 'complete') fn();
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
	domReady = true;
	exports.onReady.trigger();
	processQue();
});