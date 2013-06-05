// names is the key part of a key value pair.
// values list is either a list of acceptable values, or the maximum number of different values, eg 3 would be the same as ["one", "two", "three"]. If you aren't using a valuesList, make this the highest number you anticipate having to use.
// grow, whether the list should grow if the maximum size of a number is hit (refer to maxValue and minValue)
// float, whether the list should contain floating point numbers
// negative, whether the list should contain negative numbers
var numberList = function numberList(namesList, valuesList, grow, float, negative) {
	"use strict";
	var maxSize, maxLength;
	this.namesList = namesList;
	this.negative = negative || this.negative;
	this.grow = grow || this.grow;
	this.float = float || this.float;
	if (Array.isArray(valuesList)) {
		this.maxSize = valuesList.length;
		this.valuesList = valuesList;
	} else {
		this.maxSize = valuesList;
	}
	maxLength = this.maxSize.toString().length;
	this.length = namesList.length;
	if (float) {
		if (maxLength <= this.maxLength.i32 && this.maxSize <= this.maxValue.i32) {
			this.array = new Float32Array(this.length);
			this.type = "i32";
		} else {
			this.array = new Float64Array(this.length);
			this.type = "i64";
		}
	} else if (negative) {
		if (maxLength <= this.maxLength.i8 && this.maxSize <= this.maxValue.i8) {
			this.array = new Int8Array(this.length);
			this.type = "i8";
		} else if (maxLength <= this.maxLength.i16 && this.maxSize <= this.maxValue.i16) {
			this.array = new Int16Array(this.length);
			this.type = "i16";
		} else if (maxLength <= this.maxLength.i32 && this.maxSize <= this.maxValue.i32) {
			this.array = new Int32Array(this.length);
			this.type = "i32";
		} else {
			this.array = new Float64Array(this.length);
			this.type = "i64";
		}
	} else {
		if (maxLength <= this.maxLength.i8 && this.maxSize <= this.maxValue.u8) {
			this.array = new Uint8Array(this.length);
			this.type = "u8";
		} else if (maxLength <= this.maxLength.i16 && this.maxSize <= this.maxValue.u16) {
			this.array = new Uint16Array(this.length);
			this.type = "u16";
		} else if (maxLength <= this.maxLength.i32 && this.maxSize <= this.maxValue.u32) {
			this.array = new Uint32Array(this.length);
			this.type = "u32";
		} else {
			this.array = new Float64Array(this.length);
			this.type = "i64";
		}
	}
	// return this;
};

numberList.prototype = {
	maxValue: {
		u8: 255,
		i8: 127,
		u16: 65536,
		i16: 32767,
		u32: 4294967295,
		i32: 2147483647,
		i64: 9223372036854775807
	},
	minValue: {
		u8: 0,
		i8: -128,
		u16: 0,
		i16: -32768,
		u32: 0,
		i32: -2147483648,
		i64: -9223372036854775808
	},
	maxLength: {
		i8: 3,
		i16: 5,
		i32: 10,
		i64: 19
	},
	namesList: [],
	valuesList: [],
	maxSize: 0,
	array: [],
	type: "",
	length: 0,
	grow: false,
	float: false,
	negative: false,
	get: function(name) {
		"use strict";
		var index = this.namesList.indexOf(name);
		if (index > -1) {
			var value = this.array[index];
			if (this.valuesList.length > 0) {
				return this.valuesList[value];
			} else {
				return value;
			}
		}
	},
	set: function(name, value) {
		"use strict";
		if (typeof value !== "number") {
			if (this.valuesList.indexOf(value) === -1) {
				this.valuesList.push(value);
			}
		}
		if (this.namesList.indexOf(name) === -1) {
			this.namesList.push(name);
		}
		if (this.namesList.length > this.length) {
			this.extendArray();
		}
		if (typeof value === "number") {
			// we only care about min when we are negative, otherwise it just needs to be zero.
			if (this.negative && value < this.min) {
				if (this.grow) {
					this.growArray();
				} else {
					value = this.min;
				}
			} else if (!this.negative && value < this.min) {
				// if we aren't working with negative numbers, make it zero.
				value = 0;
			}
			if (value > this.max) {
				if (this.grow) {
					this.growArray();
				} else {
					value = this.max;
				}
			}
		} else {
			value = this.valuesList.indexOf(value);
		}
		var index = this.namesList.indexOf(name);
		if (index > -1) {
			this.array[index] = value;
		}
		return this;
	},
	convertArray: function() {
		"use strict";
		var newArray;
		if (this.type === "u32") {
			newArray = new Int32Array(this.length);
			this.type = "i32";
		} else if (this.type === "u16") {
			newArray = new Int16Array(this.length);
			this.type = "i16";
		} else if (this.type === "u8") {
			newArray = new Int8Array(this.length);
			this.type = "i8";
		}
		newArray.set(this.array);
		this.array = newArray;
		this.negative = true;
		return this;
	},
	growArray: function() {
		"use strict";
		var newArray;
		if (this.type === "u32" || this.type === "i32") {
			newArray = new Float64Array(this.length);
			this.type = "i64";
		} else {
			if (this.negative) {
				if (this.type === "i16") {
					newArray = new Uint32Array(this.length);
					this.type = "i32";
				} else if (this.type === "i8") {
					newArray = new Uint16Array(this.length);
					this.type = "i16";
				}
			} else {
				if (this.type === "u16") {
					newArray = new Int32Array(this.length);
					this.type = "u32";
				} else if (this.type === "u8") {
					newArray = new Int16Array(this.length);
					this.type = "u16";
				}
			}
		}
		newArray.set(this.array);
		this.array = newArray;
		return this;
	},
	extendArray: function() {
		"use strict";
		var newArray;
		if (this.float) {
			if (this.type === "i32") {
				newArray = new Float32Array(this.length + 1);
			} else if (this.type === "i64") {
				newArray = new Float64Array(this.length + 1);
			}
		} else if (this.negative) {
			if (this.type === "i8") {
				newArray = new Int8Array(this.length + 1);
			} else if (this.type === "i16") {
				newArray = new Int16Array(this.length + 1);
			} else if (this.type === "i32") {
				newArray = new Int32Array(this.length + 1);
			}
		} else {
			if (this.type === "u8") {
				newArray = new Uint8Array(this.length + 1);
			} else if (this.type === "u16") {
				newArray = new Uint16Array(this.length + 1);
			} else if (this.type === "u32") {
				newArray = new Uint32Array(this.length + 1);
			} else if (this.type === "i64") {
				newArray = new Float64Array(this.length + 1);
			}
		}
		this.length = this.length + 1;
		newArray.set(this.array);
		this.array = newArray;
		return this;
	},
	get max() {
		"use strict";
		return this.maxValue[this.type];
	},
	get min() {
		"use strict";
		return this.minValue[this.type];
	}
};

exports.create = function(namesList, valuesList, grow, float, negative) {
	"use strict";
	return new numberList(namesList, valuesList, grow, float, negative);
};

exports.array = function(namesList, maxLength) {
	"use strict";
	return exports.create(namesList, maxLength, true, false, true);
};

exports.object = function(namesList, valuesList) {
	"use strict";
	return exports.create(namesList, valuesList, true, false, false);
};

function indexOf(array, item) {
	for (var i = 0, l = array.length; i < l; i++) {
		if (array[i] === item) {
			return i;
		}
	}
	return -1;
}

function array_unique(arr) {
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    if (indexOf(result,arr[i]) === -1) {
      result.splice(0, 0, arr[i]);
    }
  }
  return result;
}

exports.inherit = function(namesList, valuesList, parentList) {
	"use strict";
	namesList = parentList.namesList.concat(namesList);
		namesList = array_unique(namesList);
	if (Array.isArray(valuesList)) {
		valuesList = parentList.valuesList.concat(valuesList);
		valuesList = array_unique(valuesList);
	} else {
		if (parentList.maxSize > valuesList) {
			valuesList = parentList.maxSize;
		}
	}
	return new numberList(namesList, valuesList, parentList.grow, parentList.float, parentList.negative);
};