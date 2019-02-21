// http://ssd.jpl.nasa.gov/txt/aprx_pos_planets.pdf
// http://nssdc.gsfc.nasa.gov/planetary/factsheet/
// Explanatory Supplement to the Astronomical Almanac, table 5.8.1 (p316) / 15.6 (p704)

/* 	a 	semi-major axis, au
	e 	eccentricity
	i	inclination, degrees
	o 	longitude of the ascending node, degrees
	w_bar	longitude of perihelion, degrees (w_bar = w + o)
	L	mean longitude, degrees (w_bar + M)
	n 	mean daily motion, degrees
*/

window.Ephemeris = {
	mercury: {
		name: 'Mercury',
		orbit: {
			base: {
				a: 0.38709843,
				e: 0.20563661,
				i: 7.00559432,
				o: 48.33961819,
				w_bar: 77.45771895,
				L: 252.25166724,
				P: 87.969,
				n: 4.09237706,
				epoch: 2451545.0,
			}
		},
		mass: 0.33011e24,
		radius: 2439.7,
		texture: {
			map: 'mercurymap.jpg',
			bump: 'mercurybump.jpg'
		},
		tilt: 0.01
	},
	venus: {
		name: 'Venus',
		orbit: {
			base: {
				a: 0.72333199,
				e: 0.00677323,
				i: 3.39471,
				o: 76.68069,
				w_bar: 131.53298,
				L: 181.97973,
				P: 224.701,
				n: 1.60216874,
				epoch: 2451545.0,
			}
		},
		mass: 4.8675e24,
		radius: 6051.8,
		texture: {
			map: 'venusmap.jpg',
			bump: 'venusbump.jpg'
		},
		tilt: 177.4
	},
	earth: {
		name: 'Earth',
		orbit: {
			base: {
				a: 1.00000011,
				e: 0.01671022,
				i: 0.00005,
				o: -11.26064,
				w_bar: 102.94719,
				L: 100.46435,
				P: 365.256,
				n: 0.98564736,
				epoch: 2451545.0,
			}
		},
		mass: 5.9723e24,
		radius: 6378.137,
		texture: {
			map: 'earthmap1k.jpg',
			bump: 'earthbump1k.jpg',
			lights: 'earthlights1k.jpg',	// TODO: earth needs handling separately
			clouds: 'earthcloudmap4k.png',
			specular: 'earthspec1k.jpg'
		},
		tilt: 23.4
	},
	mars: {
		name: 'Mars',
		orbit: {
			base: {
				a: 1.52371034,
				e: 0.09339410,
				i: 1.84969142,
				o: 49.55953891,
				w_bar: -23.94362959,
				L: -4.55343202,
				P: 686.980,
				n: 0.52407109,
				epoch: 2451545.0,
			}
		},
		mass: 0.64171e24,
		radius: 3396.2,
		texture: {
			map: 'mars_1k_color.jpg',
			bump: 'mars_1k_normal.jpg'
		},
		tilt: 25.2
	},
	jupiter: {
		name: 'Jupiter',
		orbit: {
			base: {
				a: 5.20248019,
				e: 0.04853590,
				i: 1.29861416,
				o: 100.29282654,
				w_bar: 14.27495244,
				L: 34.33479152,
				P: 4332.589,
				n: 0.08312944,
				b: -0.00012452,
				c: 0.06064060,
				s: -0.35635438,
				f: 38.35125000,
				epoch: 2451545.0
			}
		},
		mass: 1898.19e24,
		radius: 71492,
		texture: {
			map: 'jupitermap.jpg'
		},
		tilt: 3.1
	},
	saturn: {
		name: 'Saturn',
		orbit: {
			base: {
				a: 9.53707032,
				e: 0.05415060,
				i: 2.48446,
				o: 113.71504,
				w_bar: 92.43194,
				L: 49.94432,
				P: 10759.22,
				n: 0.03349791,
				b: 0.00025899, 
				c: -0.13434469,
				s: 0.87320147,
				f: 38.35125000,
				epoch: 2451545.0
			}
		},
		mass: 568.34e24,
		radius: 60268,
		texture: {
			map: 'saturnmap.jpg',
		},
		ring: {
			inner_radius: 74000,	// TODO: ring radius?? 
			outer_radius: 117000,	// TODO: ring radius??
			texture: {
				color: 'saturnringcolor.jpg',	// TODO: earth needs handling separately
				pattern: 'saturnringpattern.gif'
			}
		},
		tilt: 26.7
	},
	uranus: {
		name: 'Uranus',
		orbit: {
			base: {
				a: 19.19126393,
				e: 0.04716771,
				i: 0.76986,
				o: 74.22988,
				w_bar: 170.96424,
				L: 313.23218,
				P: 30685.4,
				n: 0.01176904,
				b: 0.00058331, 
				c: -0.97731848,
				s: 0.17689245,
				f: 7.67025000,
				epoch: 2451545.0
			}
		},
		mass: 86.813e24,
		radius: 25559,
		texture: {
			map: 'uranusmap.jpg'
		},
		ring: {
			inner_radius: 30000,	// TODO: ring radius?? 
			outer_radius: 50000,	// TODO: ring radius?? 
			texture: {
				color: 'uranusringcolour.jpg',
				pattern: 'uranusringtrans.gif'
			}
		},
		tilt: 97.8
	},
	neptune: {
		name: 'Neptune',
		orbit: {
			base: {
				a: 30.06896348,
				e: 0.00858587,
				i: 1.76917,
				o: 131.72169,
				w_bar: 44.97135,
				L: 304.88003,
				P: 60189.0,
				n: 0.006020076,
				b: 0.00041348,
				c: 0.68346318,
				s: -0.10162547,
				f: 7.67025000,
				epoch: 2451545.0
			}
		},
		mass: 102.413e24,
		radius: 24764,
		texture: {
			map: 'neptunemap.jpg',
		},
		tilt: 28.3
	},
	pluto: {
		name: 'Pluto',
		orbit: {
			base: {
				a: 39.48211675,
				e: 0.24882730,
				i: 17.14001206,
				o: 110.30393684,
				w_bar: 224.06891629,
				L: 238.92903833,
				P: 90560,
				n: 0.003973966,
				b: -0.01262724,
				c: 0,
				s: 0,
				f: 0,
				epoch: 2451545.0				
			}
		},
		mass: 0.01303e24,
		radius: 1187,
		texture: {
			map: 'plutomap2k.jpg',
			bump: 'plutomap2k.jpg'
		},
		tilt: 122.5
	}
}