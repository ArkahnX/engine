

exports.mainMenu = function(options, style) {

};

exports.arrayMerge = function(target, source) {
	for(var i=0;i<source.length;i++) {
		if(Array.isArray(source[i])) {
			target.push(merge([],source[i]));
		} else {
			target.push(source[i]);
		}
	}
	return target;
};