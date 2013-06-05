Array.prototype.indexOf = function indexOf(item) {
	for (var i = 0, l = this.length; i < l; i++) {
		if (this[i] === item) {
			return i;
		}
	}
	return -1;
};

Array.prototype.unique = function unique() {
  var result = [];
  for (var i = 0; i < this.length; i++) {
    if (indexOf(result,this[i]) === -1) {
      result.splice(0, 0, this[i]);
    }
  }
  return result;
}