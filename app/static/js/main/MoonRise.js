/*
	UT0 = 12h
	UT = UT0 - (GHA + lambda +- t) / 15
	+ rise; - set
	UT - UT0 < 0h.008

	cos(t) = (sin(h) - sin(phi) * sin(delta)) / cos(phi) * cos(delta)

	lamda - longitude; psi - latitude; delta - declination; h - true altitude
	h = -34 / 60 + 0.7275 * pi - 0.0353 * sqrt(H)
	civil twighlight, h = -6deg; naughtical twilight, h = -12deg; astronimical twilight, h = -18deg

	if cos(t) > +1, t = 0deg; if cos(t) < -1, t = 180deg
*/

;(function() {
	'use strict';

	var MoonRise = function(opts) {
		opts = opts || {};
		opts.latitude = opts.latitude || 51;
		opts.longitude = opts.longitude || 0.1;
		opts.date = opts.date || new Date();

		this.opts = opts;
	}

	MoonRise.prototype = {
		getMoonRiseSetTimes: function(riseSet) {
			var lat = this.opts.latitude, long = this.opts.longitude, 
			date = new Date(this.opts.date.getFullYear(), 
				this.opts.date.getMonth(), 
				this.opts.date.getUTCDate(),
				1, 0, 0);
			var ut0 = 12;

			// TODO: set for twighlight, etc
			// horizontal paralax, p; height above sea level, H (m)
			var p = -6, H = 0;
			var h = (-34 / 60) + (0.7275 * p) - (0.0353 * Math.sqrt(H));
			h = -6;

			var diff, ut, it = 0, maxIt = 50;

			do {
				// TODO: prevent duplicate calculations
				var gha = AstronomicalUtils.getGHA(date, ut0);
				console.log('gha: ' + gha);
				var t = AstronomicalUtils.getHourAngle(date, ut0, lat, long, h);
				console.log('t: ' + t);
				ut = Math.mod(ut0 - (gha + long - (t * riseSet)) / 15, 24);
				console.log('ut: ' + ut);
				diff = Math.abs(ut - ut0);
				console.log('diff: ' + diff);
				ut0 = ut;
				it++;
			} while (diff > 0.008 && it < maxIt);

			return {
				ut: ut0,
				rise: new Date(),
				set: new Date(2016, 3, 18, 4, 53, 59)
			}
		}
	};

	window.MoonRise = MoonRise;
})();


/*
MoonRise.prototype = {
	moonPhases: {
		WaxingGibbous: 1,
		properties: {
			1: { name: 'Waxing Gibbous', min: 50, max: 75 }
		}
	}	
};

var phase = moonPhases.WaxingGibbous;
var name = moonPhases.properties[phase].name;

*/