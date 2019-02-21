;(function() {
	'use strict';

	var pi = Math.PI, rads = pi / 180, cos = Math.cos, sin = Math.sin;
	var PIXELS_PER_AU = 50;

	var Orbit3D = function(eph, opts) {
		opts = opts || {};
		opts.jed = opts.jed || 2451545.0;	// J2000
		opts.tolerance = opts.tolerance || 0.000001;

		this.opts = opts;
		this.elements = eph;
		this.elements = eph.orbit.base;
	};

	Orbit3D.prototype.createOrbit = function(jed) {
		var time = jed;
		var period = this.elements.P + 1;
		var parts = this.elements.e > 0.20 ? 1000 : 500;
		var deltaT = Math.ceil(period / parts);
		var position, vector, vertices = [];
		for (var i = 0; i <= parts; i++, time += deltaT) {
			position = this.getPositionAtTime(time);
			vector = new THREE.Vector3(position[0], position[1], position[2]);
			vertices.push(vector);
		}

		var path = new THREE.Path();
		var geometry = path.createGeometry(vertices);
		var material = new THREE.LineBasicMaterial({
			color: 0x990000,
			linewidth: 1,
			opacity: 0.5
		});

		var line = new THREE.Line(geometry, material);
		return line;
	}

	// http://ssd.jpl.nasa.gov/txt/aprx_pos_planets.pdf
	// TODO: Why does my version not work??
	Orbit3D.prototype.getPositionAtTime = function(jed) {
		var e = this.elements.e;
	    var a = this.elements.a;
	    var i = this.elements.i * pi/180;
	    var o = this.elements.o * pi/180; // longitude of ascending node
	    // TODO this logic prevents values of 0 from being treated properly.
	    var p = (this.elements.w_bar || (this.elements.w + this.elements.o)) * pi/180; // LONGITUDE of perihelion
	    var ma = (this.elements.L - (this.elements.w_bar - this.elements.o)) * pi/180;

	    // Calculate mean anomaly at jed.
	    var n;
	    if (this.elements.n) {
	      n = this.elements.n * pi/180; // mean motion
	      //n = 17.0436 / sqrt(a*a*a);
	    } else {
	      n = 2*pi / this.elements.P;
	    }
	    var epoch = this.elements.epoch;
	    var d = jed - epoch;
	    var M = ma + n * d;

	    // Estimate eccentric and true anom using iterative approx.
	    var E0 = M;
	    var lastdiff;
	    do {
	      var E1 = M + e * sin(E0);
	      lastdiff = Math.abs(E1-E0);
	      E0 = E1;
	    } while(lastdiff > 0.0000001);
	    var E = E0;
	    var v = 2 * Math.atan(Math.sqrt((1+e)/(1-e)) * Math.tan(E/2));

	    // radius vector, in AU
	    var r = a * (1 - e*e) / (1 + e * cos(v)) * PIXELS_PER_AU;

	    // heliocentric coords
	    var X = r * (cos(o) * cos(v + p - o) - sin(o) * sin(v + p - o) * cos(i))
	    var Y = r * (sin(o) * cos(v + p - o) + cos(o) * sin(v + p - o) * cos(i))
	    var Z = r * (sin(v + p - o) * sin(i))
	    var ret = [X, Y, Z];
	    return ret;
	}

	Orbit3D.prototype.getPositionAtTime1 = function(jed) {
		var a = this.elements.a;
		var e = this.elements.e;
		var i = this.elements.i * rads;
		var o = this.elements.o * rads;
		var L = this.elements.L * rads;
		var w_bar = this.elements.w_bar * rads;

		// argument of perihelion, w_bar
		var p = (this.elements.w_bar || this.elements.w + this.elements.o) * rads;

		// mean daily motion of a planet, n
		// n = 2pi / P
		var n;
		if (this.elements.n) {
			n = this.elements.n * rads;
		} else {
			n = 2 * pi / this.elements.P;
		}

		// mean anomoly, M
		var d = jed - this.elements.epoch;
		var M = n * d + (L - w_bar);
		// TODO: Jupiter, Saturn, Uranus, Neptune, Pluto
		// T = (Teph - 2451545.0)/36525
		// M = L - w_bar + bT2 + ccos(fT) + ssin(fT) (when using formulae 3000BC to 3000AD)
		
		var e_star = 57.27578 * e;
		var E0 = M, E1, deltaE;
		// TODO: not sure I understand this from the documentation
		do {
			E1 = M + e * sin(E0);
			deltaE = Math.abs(E1 - E0);
			E0 = E1;
			// deltaM = M - (E1 - e_star * sin(E1));
			// deltaE = deltaM / (1 - e * cos(E1));
			// E1 = E1 + deltaE;
		} while (deltaE > this.opts.tolerance);

		var E = E0;
	}

	Orbit3D.prototype.getOrbit = function() {
		// TODO: where are we storing orbit??  (aka ellipse)
		if (!this.orbit) {
			this.orbit = this.createOrbit(this.opts.jed);
		}
		return this.orbit;
	}

	window.Orbit3D = Orbit3D;
})();