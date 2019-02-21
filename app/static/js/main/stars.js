$(function() {
	$.getJSON('static/data/stars.json', function(data) {
		render(data);
	});
});

function render(stars) {
	var tmp = 't';
}