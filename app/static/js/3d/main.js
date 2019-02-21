; function Solar3D(opts) {
    'use strict';

    var me = this;

    opts.static_prefix = opts.static_prefix || '/static';
    opts.default_camera_position = opts.camera_position || [0, 155, 32];
    opts.milky_way_visible = opts.milky_way_visible || false;
    opts.star_field_visible = opts.star_field_visible || false;
    opts.planet_orbits_visible = opts.planet_orbits_visible || true;
    opts.planets_visible = opts.planets_visible || true;
    opts.sun_scale = opts.sun_scale || 25512;
    opts.float_camera = opts.float_camera || false;
  
      // requestAnimFrame polyfill
    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                window.oRequestAnimationFrame      ||
                window.msRequestAnimationFrame     ||
                function( callback ){
                    window.setTimeout(callback, 1000 / 60);
                };
    })();

    /* constats */
    var WEB_GL_ENABLED = true;

    var stats, scene, renderer,
        camera, cameraControls,
        mouse, raycaster,
        milkyWay = null,
        stars,
        jed = toJED(new Date()),
        clock = new THREE.Clock(),
        starField,
        gradientRamp,
        planets = [], planet_orbits = [];

    var pi = Math.PI;

    // TODO: sort out promises, etc
    $.getJSON('static/data/stars.json', function(data) {
        loadImage(opts.static_prefix + '/img/star_ramp.png',
            function() {
                // make a blank canvas, this is a dom image element
                gradientRamp = document.createElement('canvas');
                gradientRamp.width = this.width;
                gradientRamp.height = this.height;

                // draw the image
                gradientRamp.getContext('2d').drawImage(this, 0, 0, this.width, this.height);

                var img = this;
                gradientRamp.getColour = function(percentage) {
                    return this.getContext('2d').getImageData(percentage * img.width, 0, 1, 1).data;
                };

                starField = generateStars(data);
                starField.visible = opts.star_field_visible;
                scene.add(starField);
            });
    }).fail(function(xhr, status, err) {
        console.log(err);
    });

    init();
    initGUI();
    animate();

    function initGUI() {
        var guiControls = function() {
            this['Show Milky Way'] = opts.milky_way_visible;
            this['Show Star Field'] = opts.star_field_visible;
            this['Show Planet Orbits'] = opts.planet_orbits_visible;
            this['Show Planets'] = opts.planets_visible;
            this['Floating Camera'] = opts.float_camera;
        };

        window.onload = function() {
            var text = new guiControls();
            var gui = new dat.GUI();
            gui.add(text, 'Show Milky Way').onChange(function() {
                toggleMilkyWay();
            });
            gui.add(text, 'Show Star Field').onChange(function() {
                toggleStarField();
            })
            gui.add(text, 'Show Planet Orbits').onChange(function() {
                togglePlanetOrbits();
            })
            gui.add(text, 'Show Planets').onChange(function() {
                togglePlanets();
            })
            gui.add(text, 'Floating Camera').onChange(function() {
                clock.running = !clock.running;
                opts.float_camera = !opts.float_camera;
            });
        }
    }

    function init() {
        stats = initStats();

        $('#loading-text').html('rendering the necessary...');
        if (isWebGLSupported()) {
            renderer = new THREE.WebGLRenderer({
                antialias: true
            });
            renderer.setClearColor(0x000000, 1);
        } else {
            return;
        }

        var $container = $(opts.container);
        var containerWidth = $container.width();
        var containerHeight = $container.height();
        renderer.setSize(containerWidth, containerHeight);
        opts.container.appendChild(renderer.domElement);

        mouse = new THREE.Vector2();
        raycaster = new THREE.Raycaster();

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 1, 5000);
        //camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.01, 100);
        //setDefaultCameraPosition();
        camera.position.set(0, 1155, 500);
        //camera.position.set(0, 0, 3);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        //scene.add(camera);

        var axis = new THREE.AxisHelper(200);
        scene.add(axis);

        addLights();
        
        cameraControls = new THREE.TrackballControls(camera, opts.container);
        cameraControls.staticMoving = true;
        cameraControls.rotateSpeed = 33;
        cameraControls.zoomSpeed = 30;
        cameraControls.panSpeed = 20;
        cameraControls.maxDistance = 500000;
        cameraControls.dynamicDampingFactor = 0.5;

        $('#loading-text').html('loading sun');
        var sunTexture = loadTexture(opts.static_prefix + '/img/sun.jpg');
        var sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: sunTexture,
            blending: THREE.AdditiveBlending,
            color: 0xFFFFFF
        }));

        sunSprite.scale.x = sunSprite.scale.y = opts.sun_scale;
        sunSprite.scale.z = 1;
        //scene.add(sunSprite);

        $('#loading-text').html('loading mercury');
        var mercuryOrbit = new Orbit3D(Ephemeris.mercury, {
            jed: jed
        });
        scene.add(mercuryOrbit.getOrbit());

        var mercury = new Body3D(Ephemeris.mercury, {
            static_prefix: opts.static_prefix,
            position: { x: 10, y: 10, z: 10 },
            scale: opts.sun_scale
        });
        scene.add(mercury.getPlanet());

        $('#loading-text').html('loading venus');
        var venusOrbit = new Orbit3D(Ephemeris.venus, {
            jed: jed
        });
        scene.add(venusOrbit.getOrbit());

        var venus = new Body3D(Ephemeris.venus, {
            static_prefix: opts.static_prefix,
            position: { x: 0, y: 10, z: 10 },
            scale: opts.sun_scale
        });
        scene.add(venus.getPlanet());

        $('#loading-text').html('loading earth');
        var earthOrbit = new Orbit3D(Ephemeris.earth, {
            jed: jed
        });
        scene.add(earthOrbit.getOrbit());

        var earth = new Body3D(Ephemeris.earth, {
            static_prefix: opts.static_prefix,
            position: { x: 0, y: 0, z: 0 },
            scale: opts.sun_scale
        });
        scene.add(earth.getPlanet());

        $('#loading-text').html('loading mars');
        var marsOrbit = new Orbit3D(Ephemeris.mars, {
            jed: jed
        });
        scene.add(marsOrbit.getOrbit());

        var mars = new Body3D(Ephemeris.mars, {
            static_prefix: opts.static_prefix,
            position: { x: 10, y: 0, z: 10 },
            scale: opts.sun_scale
        });
        scene.add(mars.getPlanet());

        $('#loading-text').html('loading jupiter');
        var jupiterOrbit = new Orbit3D(Ephemeris.jupiter, {
            jed: jed
        });
        scene.add(jupiterOrbit.getOrbit());

        var jupiter = new Body3D(Ephemeris.jupiter, {
            static_prefix: opts.static_prefix,
            position: { x: 20, y: 20, z: 20 },
            scale: opts.sun_scale
        });
        scene.add(jupiter.getPlanet());

        $('#loading-text').html('loading saturn');
        var saturnOrbit = new Orbit3D(Ephemeris.saturn, {
            jed: jed
        });
        scene.add(saturnOrbit.getOrbit());

        var saturn= new Body3D(Ephemeris.saturn, {
            static_prefix: opts.static_prefix,
            position: { x: 20, y: 10, z: 0 },
            scale: opts.sun_scale
        });
        scene.add(saturn.getPlanet());

        $('#loading-text').html('loading uranus');
        var uranusOrbit = new Orbit3D(Ephemeris.uranus, {
            jed: jed
        });
        scene.add(uranusOrbit.getOrbit());

        var uranus = new Body3D(Ephemeris.uranus, {
            static_prefix: opts.static_prefix,
            position: { x: 10, y: 20, z: 10 },
            scale: opts.sun_scale
        });
        scene.add(uranus.getPlanet());

        $('#loading-text').html('loading neptune');
        var neptuneOrbit = new Orbit3D(Ephemeris.neptune, {
            jed: jed
        });
        scene.add(neptuneOrbit.getOrbit());

        var neptune = new Body3D(Ephemeris.neptune, {
            static_prefix: opts.static_prefix,
            position: { x: 10, y: 10, z: 20 },
            scale: opts.sun_scale
        });
        scene.add(neptune.getPlanet());

        $('#loading-text').html('loading pluto');
        var plutoOrbit = new Orbit3D(Ephemeris.pluto, {
            jed: jed
        });
        scene.add(plutoOrbit.getOrbit());

        var pluto = new Body3D(Ephemeris.pluto, {
            static_prefix: opts.static_prefix,
            position: { x: 20, y: 10, z: 10 },
            scale: opts.sun_scale
        });
        scene.add(pluto.getPlanet());

        planet_orbits = [mercuryOrbit, venusOrbit, earthOrbit, marsOrbit, jupiterOrbit, saturnOrbit, uranusOrbit, neptuneOrbit, plutoOrbit];
        planets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto];

        milkyWay = skyDome();
        milkyWay.visible = opts.milky_way_visible;
        scene.add(milkyWay);

        opts.container.addEventListener('mousedown', onDocumentMouseDown, false);
        opts.container.addEventListener('touchstart', onDocumentTouchStart, false);
        window.addEventListener('resize', onWindowResize, false);
    }

    function addLights() {
        var light = new THREE.AmbientLight(0x222222);
        scene.add(light);

        light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(40, 0, 0);
        light.castShadow = true;
        light.shadow.camera.near = 0.01;
        light.shadow.camera.far = 15;
        light.shadow.camera.fov = 45;
        light.shadow.camera.left = -1;
        light.shadow.camera.right =  1;
        light.shadow.camera.top =  1;
        light.shadow.camera.bottom = -1;
        // light.shadowCameraVisible = true;
        light.shadow.bias    = 0.001;
//        light.shadowDarkness    = 0.2;
        light.shadow.mapSize.width    = 1024;
        light.shadow.mapSize.height   = 1024;
        scene.add(light);
    }

    function skyDome() {
        $('#loading-text').html('rendering sky dome...');

        // TODO: image https://www.eso.org/public/images/eso0932a/ (MUST be credited)
        var geometry = new THREE.SphereGeometry(3000, 60, 40);
        var uniforms = {
            texture: { type: 't', value: loadTexture(opts.static_prefix + '/img/eso_dark.jpg') }
        };

        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: document.getElementById('sky-vertex').textContent,
            fragmentShader: document.getElementById('sky-fragment').textContent,
        });

        var skySphere = new THREE.Mesh(geometry, material);
        skySphere.scale.set(-1, 1, 1);
        skySphere.rotation.order = 'XZY',
        skySphere.rotation.z = pi / 2,
        skySphere.rotation.x = pi,
        skySphere.renderDepth = 10000.0;

        return skySphere;
    }

    function toggleMilkyWay() {
        milkyWay.visible = opts.milky_way_visible = !opts.milky_way_visible;
    }

    function toggleStarField() {
        starField.visible = opts.star_field_visible = !opts.star_field_visible;
    }

    function togglePlanetOrbits() {
        opts.planet_orbits_visible = !opts.planet_orbits_visible;

        if (opts.planet_orbits_visible) {
            for (var i = 0; i < planet_orbits.length; i++) {
                scene.add(planet_orbits[i].getOrbit());
            }
        } else {
            for (var i = 0; i < planet_orbits.length; i++) {
                scene.remove(planet_orbits[i].getOrbit());
            }
        }
    }

    function togglePlanets() {
        opts.planets_visible = !opts.planets_visible;

        if (opts.planets_visible) {
            for (var i = 0; i < planets.length; i++) {
                planets[i].visible = true;
//                scene.add(planets[i].getPlanet());
            }
        } else {
            for (var i = 0; i < planets.length; i++) {
                planets[i].visible = false;
//                scene.remove(planets[i].getPlanet());
            }
        }
    }

    function setFloatingCamera() {
        var delta = 0.0001 * Date.now();
        camera.position.x = Math.sin(delta) * 25;
        camera.position.z = 100 + Math.cos(delta) * 20;
//        cameraControls.update(delta);
    }

    function animate() {
        stats.update();

        if (opts.float_camera) {
            setFloatingCamera();
        }

        render();
        requestAnimFrame(animate);
    }

    function render(force) {
        cameraControls.update();

        renderer.render(scene, camera);
    }

    function isWebGLSupported() {
        return WEB_GL_ENABLED && Detector.webgl;
    }

    function initStats() {
        var stats = new Stats();
        stats.setMode(0);
        $('#stats-container').append(stats.domElement);
        return stats;
    }

    function generateStars(stars) {
        var uniforms = {
            color: { type: 'c', value: new THREE.Color(0xFFFFFF) },
            texture: { type: 't', value: loadTexture(opts.static_prefix + '/img/star.png') }
        };

        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: document.getElementById('star-vertex').textContent,
            fragmentShader: document.getElementById('star-fragment').textContent,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false,
            transparent: true,
            sizeAttenuation: true,
            opacity: 0.0,
        });

        var radius = 50; // TODO: use 1 parsec!!
        var geometry = new THREE.BufferGeometry();
        var count = stars.length;

        var star, starMagnitude, starName, starSpectralType;
        var positions = new Float32Array(count * 3),
            colors = new Float32Array(count * 3),
            sizes = new Float32Array(count);

        var color = new THREE.Color();

        stars.forEach(function(star, idx) {
            if (star[0] === 0) return true;
            var i = idx * 3;
            positions[i + 0] = star[5] * radius;
            positions[i + 1] = star[6] * radius;
            positions[i + 2] = star[7] * radius;

            var hueShift = 1.0 - star[8];
            hueShift = constrain(hueShift, 0.0, 1.0);
            var lookupColor = gradientRamp.getColour(hueShift);
            colors[i + 0] = lookupColor[0] / 255; //1.0; //color.r;
            colors[i + 1] = lookupColor[1] / 255; //1.0; //color.g;
            colors[i + 2] = lookupColor[2] / 255; //1.0; //color.b;

            sizes[i] = 5;
        });

        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.addAttribute('multiplyScalar', new THREE.BufferAttribute(50, 1));

        var particleSystem = new THREE.Points(geometry, shaderMaterial);
        return particleSystem;
    }

    // http://threejs.org/examples/canvas_interactive_cubes.html
    function onDocumentTouchStart(event) {
        event.preventDefault();

        event.clientX = event.touches[0].clientX;
        event.clientY = event.touches[0].clientY;
        onDocumentMouseDown(event);
    }

    function onDocumentMouseDown(event) {
        event.preventDefault();

        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        planets.forEach(function(planet) {
            var intersects = raycaster.intersectObject(planet.getPlanet());
            if (intersects. length > 0) {
                console.log(intersects);
            }
        });

        // var intersects = raycaster.intersectObjects(planets);

        // if (intersects.length > 0) {
        //     // intersects[0].uv.x * textureWidth;
        //     console.log(intersects);
        // }
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}