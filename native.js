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
		if (result.indexOf(this[i]) === -1) {
			result.splice(0, 0, this[i]);
		}
	}
	return result;
};

Math.round = function round(number) {
	var rounded = 0;
	if (number > 0) {
		rounded = ~~ (0.5 + number);
	} else {
		rounded = ~~ (-0.5 + number);
	}
	return rounded;
};

Math.prototype.roundBetween = function roundBetween(start, end, array) {
	var mround = Math.round;
	var roundedStart = mround(start);
	var roundedEnd = mround(end);
	var numbers = array || [];
	for (var i = roundedStart; i < roundedEnd; i++) {
		numbers.push(i);
	}
	numbers.push(roundedEnd);
	return numbers;
};