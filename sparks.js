;(function(exports) {

	// Node compaitibility
	var _  = exports._, d3 = exports.d3;
	if (!_ && !d3 && typeof require !== 'undefined') {
		_  = require('underscore');
		d3 = require('d3');
	}

	var sparks = {};

	/** Cribbed from Backbone **/
	// Helper function to correctly set up the prototype chain, for subclasses.
	// Similar to `goog.inherits`, but uses a hash of prototype properties and
	// class properties to be extended.
	var extend = function(protoProps, staticProps) {
		var parent = this;
		var child;

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if (protoProps && _.has(protoProps, 'constructor')) {
		  child = protoProps.constructor;
		} else {
		  child = function(){ return parent.apply(this, arguments); };
		}

		// Add static properties to the constructor function, if supplied.
		_.extend(child, parent, staticProps);

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		var Surrogate = function(){ this.constructor = child; };
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate;

		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if (protoProps) _.extend(child.prototype, protoProps);

		// Set a convenience property in case the parent's prototype is needed
		// later.
		child.__super__ = parent.prototype;

		return child;
	};

	var Visualization = function(options) {
		this.options = options || (options = {});
		this.data = options.data || [];
		this.el = options.el || document.createElement('div');
		this.d3el = d3.select(this.el);
		this.width = options.width || 300;
		this.height = options.height || 200;

		if (this.className) {
			this.el.classList.add(this.className);
		}

		this.initialize.apply(this, arguments);
	}

	_.extend(Visualization.prototype, {
		initialize: function() {},
		enter: function() {},
		update: function() {},
		exit: function() {}
	})

	Visualization.extend = extend;

	var Sparkline = Visualization.extend({
		className: 'sparkline',

		initialize: function() {
			this.scales = {
				x: d3.scale.linear(),
				y: d3.scale.linear()
			}
			this.line = d3.svg.line();
			this.d3el.append('svg')
				.attr({
					width: this.width,
					height: this.height
				})
				.append('g')
				.attr('class', 'geom');
		},

		train: function() {
			this.scales.x.range([0, this.width]);
			this.scales.y.range([this.height, 0]);
			var xExtent = d3.extent(_.pluck(this.data, '0'));
			var yExtent = d3.extent(_.pluck(this.data, '1'));
			this.scales.x.domain(xExtent);
			this.scales.y.domain(yExtent);
		},

		scaleData: function() {
			return _.map(this.data, function(points) {
				return [
					this.scales.x(points[0]),
					this.scales.y(points[1])
				];
			}, this);
		},

		enter: function(selection) {
			return selection.append('path');
		},

		update: function(selection) {
			return selection.attr('d', this.line);
		},

		exit: function(selection) {
			return selection.remove();
		},

		render: function() {
			this.train();
			var data = this.scaleData();
			var paths = this.d3el.select('svg .geom')
				.selectAll('path')
				.data([data]);
			this.enter(paths.enter());
			this.update(paths);
			this.exit(paths.exit());
			return this;
		}
	});

	_.extend(sparks, {
		Visualization: Visualization,
		Sparkline: Sparkline
	});

	// external browser & Node API
	exports.sparks = sparks;

}(this));