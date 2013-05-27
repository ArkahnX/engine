/*global define:true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, es5:true, indent:4, maxerr:50, camelcase:false, boss:true, smarttabs:true, white:false */
define([], function() {
	"use strict";
	return {
		round: function(number) {
			var rounded = 0;
			if (number > 0) {
				rounded = ~~ (0.5 + number);
			} else {
				rounded = ~~ (-0.5 + number);
			}
			return rounded;
		},
		roundBetween: function(start, end) {
			var roundedStart = this.round(start);
			var roundedEnd = this.round(end);
			var numbers = [];
			for (var i = roundedStart; i < roundedEnd; i++) {
				numbers.push(i);
			}
			numbers.push(roundedEnd);
			return numbers;
		},
		mixin: function(receiver, supplier) {
			Object.keys(supplier).forEach(function(value, property) {
				Object.defineProperty(receiver, Object.getOwnPropertyDescriptor(supplier, property));
			});
		}
	};
});