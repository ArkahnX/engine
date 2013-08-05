var path = require("path");
var root = path.dirname(global.require.main.filename);
var readwrite = require(path.resolve(root, "engine/readwrite.js"));
var core = require(path.resolve(root, "engine/core.js"));
var Callback = require(path.resolve(root, "engine/callback.js"));
var assets = {};
var directories = {};
var built = {};

exports.onAssetsReady = Callback.create("onAssetsReady", true);

function addAsset(modPath, manifest, callback) {
	assets[manifest.id] = {
		manifest: manifest,
		disabled: false,
		path: modPath,
		conflicts: [],
		activeMods: null // object modName:{methods:[],attributes:[],template:[],media:[]}
	};
	if (typeof callback === "function") {
		callback();
	}
}

exports.listAssets = function() {
	console.log(assets);
};

function add(i, mods) {
	if (i === mods.length) {
		return activateMods();
	}
	var modManifestPath = mods[i];
	var modPath = path.dirname(modManifestPath);
	readwrite.read(modManifestPath, function(manifest) {
		manifest = JSON.parse(manifest);
		directories[manifest.id] = modPath;
		if (!assets[manifest.id] || !assets[manifest.id].manifest || assets[manifest.id].version !== manifest.version) {
			addAsset(modPath, manifest, function() {
				add(i + 1, mods);
			});
		}
	});
}

exports.loadMods = function() {
	console.groupCollapsed("finding mods");
	console.time('findMods');
	readwrite.readMods(function(mods) {
		console.log(mods)
		console.timeEnd('findMods');
		console.groupEnd();
		add(0, mods);
	});

};

var checkRequires = function(mod, callback, error) {
	var notFound = [];
	var wrongVersion = [];
	var idList = mod.manifest.requires;
	if (!idList) {
		return callback(mod);
	}
	for (var id in idList) {
		if (!directories[id] || !assets[id]) {
			notFound.push(id);
		} else if (assets[id].manifest.version !== idList[id]) {
			// check major version number. Since we are using semantic versioning (http://semver.org/), only the major version number should cause regressions in code support.
			if (assets[id].manifest.version.charAt(0) !== idList[id].charAt(0)) {
				wrongVersion.push(id);
			}
		}
	}
	if (notFound.length === 0 && wrongVersion.length === 0) {
		return callback(mod);
	}
	return error(mod, notFound, wrongVersion);
};

var checkExists = function(id, callback, error) {
	if (directories[id]) {
		return callback(id);
	}
	return error(id);
};

var activateMods = function() {
	console.time('activateMods');
	console.groupCollapsed("activating mods");
	//loop through all discovered mods.
	for (var modPath in assets) {
		var thisMod = assets[modPath];
		checkRequires(thisMod, function(thisMod) {
			//if all required assets are present
			if (thisMod.manifest.modify) {
				//if it has no mods, we don't need to do anything and can happily move to the next mod.
				for (var modId in thisMod.manifest.modify) {
					checkExists(modId, function(modId) {
						if (assets[modId].activeMods === null) {
							assets[modId].activeMods = {};
						}
						var sourceMod = thisMod.manifest.modify[modId];
						var targetMod = assets[modId];
						var targetModAssets = targetMod.manifest.assets;
						targetMod.activeMods[thisMod.manifest.id] = {};
						// check for method modifications
						if (sourceMod.methods && sourceMod.methods.length !== 0) {
							if (!targetMod.activeMods.methods) {
								targetMod.activeMods.methods = {};
							}
							targetMod.activeMods.methods[thisMod.manifest.id] = sourceMod.methods;
						}
						//check for attribute modification
						if (sourceMod.attributes && sourceMod.attributes.length !== 0) {
							if (!targetMod.activeMods.attributes) {
								targetMod.activeMods.attributes = {};
							}
							targetMod.activeMods.attributes[thisMod.manifest.id] = sourceMod.attributes;
						}
						// check for media modifications
						if (sourceMod.media && sourceMod.media.length !== 0) {
							if (!targetMod.activeMods.media) {
								targetMod.activeMods.media = {};
							}
							targetMod.activeMods.media[thisMod.manifest.id] = sourceMod.media;
						}
						//check for template modifications
						if (sourceMod.templates && sourceMod.templates.length !== 0) {
							if (!targetMod.activeMods.templates) {
								targetMod.activeMods.templates = {};
							}
							targetMod.activeMods.templates[thisMod.manifest.id] = sourceMod.templates;
						}
					});
				}
			}
		}, function(thisMod, notFound, wrongVersion) {
			// if we couldnt match all the required assets, we need to stop.
			thisMod.disabled = true;
			console.error("The mod '", thisMod.manifest.name, "' is missing the following required mods: ", notFound);
			if (wrongVersion.length) {
				console.error("The following required mods for '", thisMod.manifest.name, "' have the wrong version: ", wrongVersion);
			}
		});
	}
	console.timeEnd('activateMods');
	console.groupEnd();
	setup();
};

function setup() {
	console.group("building mods");
	console.time('buildMods');
	for (var assetId in assets) {
		build(assetId);
	}
	console.timeEnd('buildMods');
	console.groupEnd();
	console.timeEnd('assetLoaders');
	exports.onAssetsReady.trigger();
}

function build(assetId, parentId) {
	var rootModAssets = assets[assetId];
	var thisAssets = rootModAssets.manifest.assets;
	if (rootModAssets.disabled === false) {
		console.groupCollapsed("building ", assetId);
		console.time("buildAsset-" + assetId);
		if (!built[assetId]) {
			var main_file = require(path.resolve(root, directories[assetId], rootModAssets.manifest.main_file));
			built[assetId] = {};
			built[assetId].self = main_file;
		}
		var types = ["methods", "media", "templates", "attributes"];

		if (rootModAssets.manifest.assets) {
			for (var i = 0; i < types.length; i++) {
				var thisType = types[i];
				var grouped = false;
				if (rootModAssets.manifest.assets[thisType] && rootModAssets.manifest.assets[thisType].length) {
					if (!built[assetId][thisType]) {
						console.groupCollapsed("building ", assetId, ": ", thisType);
						grouped = true;
						built[assetId][thisType] = {};
						for (var e = 0; e < thisAssets[thisType].length; e++) {
							var thisModAsset = thisAssets[thisType][e];
							console.log(thisModAsset)
							built[assetId][thisType][thisModAsset] = main_file[thisModAsset];
							if (!main_file[thisModAsset]) { // if we dont have the asset in the main file, copy the data over.
								var fs = require("fs");
								// make sure the file exists first, throw a human readable error otherwise.
								var fileName = path.resolve(root, directories[assetId], thisModAsset);
								fs.exists(fileName, function(exists) {
									if (exists) {
										if (thisType === "templates" || thisType === "attributes") { // if its a template or attributes JSON we want the ascii data.
											fs.readFile(fileName, 'utf8', function(err, data) {
												if (err) {
													throw err;
												}
												built[assetId].self[thisModAsset] = data;
											});
										} else if (thisType === "media") { // for media we just want the path.
											built[assetId].self[thisModAsset] = path.resolve(root, directories[assetId], thisModAsset);
										}
									} else {
										console.error("You forgot to include file: '",thisModAsset,"' in mod: '",directories[assetId],"' which was referenced in the manifest file.")
									}
								});
							} else {
								built[assetId].self[thisModAsset] = main_file[thisModAsset];
							}
						}
					} else {
						console.log("Built type ", thisType, " already.");
					}
					if (rootModAssets.activeMods && rootModAssets.activeMods[thisType]) {
						console.log("modding ", assetId, ": ", thisType);
						for (var modId in rootModAssets.activeMods[thisType]) {
							build(modId, assetId);
							var thisMod = rootModAssets.activeMods[thisType][modId];
							var thisModFile = built[assetId].self;
							for (var r = 0; r < thisMod.length; r++) {
								var thisModAsset = thisMod[r];
								// replace the original data with mod data!
								built[assetId][thisType][thisModAsset] = built[modId][thisType][thisModAsset];
								built[assetId].self[thisModAsset] = built[modId][thisType][thisModAsset];
							}
						}
					}
					if (grouped) {
						console.groupEnd();
					}
				}
			}
		}
		console.timeEnd("buildAsset-" + assetId);
		console.groupEnd();
	}
}

exports.get = function(id, component) {
	// make sure it has a directory
	if (directories[id]) {
		//make sure that directory has been loaded, and then built
		if (assets[id] && built[id]) {
			if (assets[id].disabled === false) {
				if (component) {
					if (component === "manifest") {
						return assets[id].manifest || null;
					}
					if (component === "media") {
						return built[id].media || null;
					}
					if (component === "templates") {
						return built[id].templates || null;
					}
					if (component === "attributes") {
						return built[id].attributes || null;
					}
					if (component === "methods") {
						return built[id].methods || null;
					}
					if (built[id].self[component]) {
						return built[id].self[component];
					}
					built[id].self;
				} else {
					return built[id].self;
				}
			} else {
				console.error("module ", id, " is disabled.")
			}
		} else {
			console.error("error loading module ", id, ". Some debug stuff: ", id, assets, built);
		}
	} else {
		console.error("module ", id, " doesn't exist.");
	}
}

// todo
// check version requirement. DONE
// make sure no methods overlap
// merging modules
// loading modules

// draw flow chart

// load mods on initialization
// get should return the mod asset object, or a component with get(assetId [, manifest/activeMods/assets/methods/templates])
// fix initial build so it deletes old and updates new.


// remove anything that isnt in cache from assets object. DONE, no old assets object is solution