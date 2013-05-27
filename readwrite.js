var fs = require('fs');
var path = require('path');
var root = path.dirname(global.require.main.filename);
exports.save = function(string, filePath, callback) {
	if (Array.isArray(filePath)) {
		exports.write(string, path.resolve(root, "data", filePath + ".json"), callback);
	} else {
		exports.write(string, path.resolve(root, "data", filePath + ".json"), callback);
	}
};
exports.write = function(string, filePath, callback) {
	fs.writeFile(path.resolve(root, filePath), string, callback);
};
exports.load = function(fileID, callback, error) {
	exports.read(path.resolve(root, "data", fileID + ".json"), callback, error)
};
exports.read = function(filePath, callback, error) {
	fs.exists(path.resolve(root, filePath), function(exists) {
		if (exists) {
			fs.readFile(path.resolve(root, filePath), "utf-8", function(err, data) {
				if (err) {
					throw err;
				}
				callback(data);
			});
		} else {
			error();
		}
	});
};

function matchFile(entry) {
	if (entry.name.indexOf("manifest.json") > -1) {
		// console.log(entry.name, entry.parentDir)
		return true;
	}
	return false;
}

function matchFolder(entry) {
	if (entry.name.indexOf("game") > -1 || entry.name.indexOf("mods") > -1 || entry.parentDir.indexOf("game") > -1 || entry.parentDir.indexOf("mods") > -1) {
		// console.log(entry.name, entry.parentDir)
		return true;
	}
	return false;
}
exports.readMods = function(callback) {
	var info = {
		name: "",
		parentDir: ""
	};
	var walk = function(dir, fileFilter, directoryFilter, done) {
		var results = [];
		fs.readdir(root+path.sep+dir, function(err, list) {
			if (err) return done(err);
			var i = 0;
			(function next() {
				var file = list[i++];
				if (!file) return done(null, results);
				file = dir+path.sep+file;
				fs.stat(file, function(err, stat) {
					info.name = file;
					info.parentDir = dir;
					if (stat && stat.isDirectory() && directoryFilter(info)) {
						walk(file,  fileFilter, directoryFilter,function(err, res) {
							results = results.concat(res);
							next();
						});
					} else {
						if (fileFilter(info)) {
							results.push(file);
						}
						next();
					}
				});
			})();
		});
	};
	walk("game", matchFile, matchFolder, function(err, gameResults) {
		if (err) {
			console.error(err);
		}
		walk("mods", matchFile, matchFolder, function(err, modResults) {
			if (err) {
				console.error(err);
			}
			callback(gameResults.concat(modResults));
		});
	});
};