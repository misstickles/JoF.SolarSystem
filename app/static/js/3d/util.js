// calculate the Julian Ephemeris Date
function toJED(date) {
	return Math.floor((date.getTime() / 86400000) - 0.5) + 2440588;
//	return Math.floor((date.getTime() / (1000 * 60 * 60 * 24)) - 0.5) + 2440588;
}

function constrain(value, min, max){
	if(value < min)
		value = min;
	else if(value > max)
		value = max;
	return value;
}

function loadTexture(path) {
    return new THREE.TextureLoader().load(path);
}

function loadImage(path, callback) {
    var image = new Image();
    image.onload = callback;
    image.src = path;
    return image;
}
