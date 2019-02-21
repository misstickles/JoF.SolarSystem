;(function() {
	'use strict';

	var Body3D = function(body, opts) {
		opts = opts || {};
		opts.scale = opts.scale || 6378;

		this.opts = opts;
		this.body = body;
	};

	Body3D.prototype.getPlanet = function() {
		var planet = new THREE.Object3D();

		var radius = this.body.radius / this.opts.scale;
	
		var geometry = new THREE.SphereGeometry(radius, 32, 32);	// TODO: use proper diameter
		var material = new THREE.MeshPhongMaterial({
			map: loadTexture(this.opts.static_prefix + '/img/' + this.body.texture.map),
			name: "planet"
		});

		if (this.body.texture.bump) {
			material.bumpMap = loadTexture(this.opts.static_prefix + '/img/' + this.body.texture.bump);
			material.bumpScale = 0.005;	// TODO: proportional to size
		}

		if (this.body.texture.specular) {
			material.specularMap = loadTexture(this.opts.static_prefix + '/img/' + this.body.texture.specular);
			material.specular = new THREE.Color('grey');
		}

		planet.add(new THREE.Mesh(geometry, material));

		if (this.body.texture.clouds) {
			var cloudsGeometry = new THREE.SphereGeometry(radius * 1.01, 32, 32);
			var cloudsMaterial = new THREE.MeshPhongMaterial({
				map: loadTexture(this.opts.static_prefix + '/img/' + this.body.texture.clouds),
				side: THREE.DoubleSide,
				opacity: 0.8,
				transparent: true,
				name: "clouds"
			});

			planet.add(new THREE.Mesh(cloudsGeometry, cloudsMaterial));
		}

		if (this.body.ring) {
			var ringGeometry = new THREE.RingGeometry(
				this.body.ring.inner_radius / this.opts.scale, 
				this.body.ring.outer_radius / this.opts.scale,
				32,
				32);
			var ringMaterial = new THREE.MeshLambertMaterial({
				map: loadTexture(this.opts.static_prefix + '/img/' + this.body.ring.texture.color),
				side: THREE.DoubleSide,
				transparent: true,
				name: "rings"
			});

			planet.add(new THREE.Mesh(ringGeometry, ringMaterial));
		}

		planet.position.set(this.opts.position.x, this.opts.position.y, this.opts.position.z);
		planet.rotation.x = this.body.tilt * Math.PI / 180;

		return planet;
	};

	window.Body3D = Body3D;
})();