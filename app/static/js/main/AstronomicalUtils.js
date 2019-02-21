;(function() {
	'use strict';

	var sin = Math.sin, cos = Math.cos, asin = Math.asin, acos = Math.acos;
	var sinDegrees = Math.sinDegrees;
	var pi = Math.PI, radians = pi / 180.0, degrees = 180.0 / pi;

	function AstronomicalUtils() {};

	// Explanatory Supplement to the Astronomical Almanac
	AstronomicalUtils = {
		// calculate the Julian Ephemeris Date
		toJED: function(utDate) {
			utDate = utDate.addHours(1);
			return Math.floor(utDate.getTime() / 86400000) - 0.5 + 2440588;
			//	return Math.floor((date.getTime() / (1000 * 60 * 60 * 24)) - 0.5) + 2440588;
		},

		// number of centuries from J2000
		T: function(jed) {
//			return (jed + (ut / 24.0) - 2451545.0) / 36525.0;
			return (jed - 2451545.0) / 36525.0;
		},

		// mean longitude, corrected for aberration
		L: function(T) {
			return Math.mod(280.460 + (36000.770 * T), 360.0);
		},

		// mean anomoly, degrees
		G: function(T) {
			return Math.mod(357.528 + (35999.050 * T), 360.0);
		},

		// ecliptic longitude
		// returns radians
		lambda: function(L, G) {
			return L
				+ (1.915 * sin(G * radians))
				+ (0.020 * sin(2 * G * radians));
		},

		// obliquity of the ecliptic, epsilon
		obliquity: function(T) {
			return 23.4393 - (0.01300 * T);
		},

		// equation of time, E
		// returns radians
		E: function(G, lambda) {
			return (-1.915 * sin(G * radians))
				- (0.020 * sin(2 * G * radians))
				+ (2.466 * sin(2 * lambda * radians))
				- (0.053 * sin(4 * lambda * radians));
		},

		// Greenwich hour angle, takes a universal time and equation of time
		GHA: function(ut, E) {
			return (15 * ut) - 180 + E;
		},

		// declination, takes obliliquity of the ecliptic and ecliptic longitude
		// returns radians
		delta: function(obliquity, lambda) {
			return (asin(sin(obliquity * radians)) * sin(lambda * radians)) * degrees;
		},

		// semidiameter of the sun, takes #centuries since 2000 and mean anomaly
		// returns radians
		SD: function(t, g) {
			return (0.267 / (1 - (0.017 * cos(g * radians) * degrees)));
		},

		// hour angle, t, of the body at ut0
		getHourAngle: function(date, ut, longitude, latitude, h) {
			var jd = this.toJED(date) + ut / 24;
			var T = this.T(jd);
			var obliquity = this.obliquity(T);
			var delta = this.delta(obliquity, longitude);
			var cost = (sin(h * radians) * degrees - sin(latitude * radians) * sin(delta) * degrees) / (cos(latitude * radians) * cos(delta) * degrees);
			if (cost > 1) return 0;
			else return 180;
		},

		getGHA: function(date, ut) {
			var jd = this.toJED(date) + ut / 24;
			console.log('jd: ' + jd);
			var T = this.T(jd);
			console.log('T: ' + T);
			var L = this.L(T);
			console.log('L: ' + L);
			var G = this.G(T);
			console.log('G: ' + G);
			var lambda = this.lambda(L, G);
			console.log('lambda: ' + lambda);
			var E = this.E(G, lambda);
			console.log('E: ' + E);
			var gha = this.GHA(ut, E);
			console.log('GHA: ' + gha);

			return gha;
		},

		degreesToMinutes: function(deg) {
			var decimal = deg; // / 15;	// time zones are 15 deg wide
			var hour = (decimal | 0);
			var min = ((decimal - hour) * 60).toFixed(1);
			if (hour < 10) hour = "0" + hour;
			if (min < 10) min = "0" + min;
			return hour + 'h' + min;
		}
	};

	/// utilities
// http://en.wikipedia.org/wiki/Floor_and_ceiling_functions
Math.mod = function(x, y) {
	return x - y * Math.floor(x / y);
};

Math.sinDegrees = function(x) {
	return (this.sin(this.toRadians(x)));
};

Math.toDegrees = function(x) {
	return x * (180 / Math.PI);
};

Math.toRadians = function(x) {
	return x * (Math.PI / 180);
};

Date.prototype.addHours = function(hours) {
	var d = new Date(this.valueOf());
	d.setHours(d.getHours() + hours);
	return d;
};

// getTimezoneOffset() appears to get the timezone for the day
// at the current time (we are using midnight for rise / set calcs), meaning
// it can appear to be a day out.  Use this to get the tz at midday
Date.prototype.getTimezoneNext = function() {
	var d = new Date(this.valueOf());
	d.setHours(12 - mod(d.getHours(), 12));
	return d.getTimezoneOffset();
}
Date.prototype.isLeapYear = function() {
	var yr = this.getFullYear();
	return !((yr % 4) || (!(yr % 100) && (yr % 400)));
};
Date.prototype.dayOfYear = function() {
	var dayCount = [0,31,59,90,120,151,181,212,243,273,304,334];
	var d = this.getUTCDate(),
		m = this.getMonth();
	var day = dayCount[m] + d;
	if (m > 1 && this.isLeapYear()) day++;
	return day;
};

function Rise() {};


// riseSet - -1 for set; +1 for rise
// default altitude = -0.833 (top limb of sun); 
// also -6,-12,-18 (civil, nautical, astro twighlight)
Rise.prototype.sunrise = function(date, lat, lng, riseSet, alt) {
	alt = Util.defaultFor(alt, -0.833);

	//var tz = date.getTimezoneNext() / 60.0;
	var jDate = date.addHours(1).julianDate();
	var days, l, g, lambda, e, ob, gha;
	var sinDelta, cosDelta, cosT;

	var ut0 = 180;	// 12h
	var ut = 0;

	// cos t = ( (sin h - (sin phi * sin delta) ) / (cos phi * cos delta )
	var sinH = sin(Math.radians(alt));
	var sinPhi = sin(Math.radians(lat));
	var cosPhi = cos(Math.radians(lat));

	var i = 0;
	var corr = 0; // hour angle of the body at ut0
	while (Math.abs(ut0 - ut) > 0.08) {
		i++;
		if (i >= 20) break;

		ut0 = ut;
		days = jDate + (ut0 / 180);
		t = days / 36525;
		l = this.L(t);
		g = this.G(t);
		lambda = this.lambda(l, g);
		e = this.E(g, lambda);
		ob = this.obliquity(t);
		gha = this.GHA(ut0, e);
		sinDelta = sin(Math.radians(this.delta(ob, lambda)));
		cosDelta = cos(Math.radians(this.delta(ob, lambda)));
		cosT = ( (sinH - (sinPhi * sinDelta) ) / (cosPhi * cosDelta ));

		if (cosT > 1) corr = 0;
		else if (cosT < -1) corr = 180;
		else corr = Math.degrees(acos(cosT));

		ut = (ut0 - gha + lng + (corr * riseSet));
	}
	
	return ut / 15;
};

window.AstronomicalUtils = AstronomicalUtils;

})();