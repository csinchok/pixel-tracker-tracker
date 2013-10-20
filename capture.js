function isPixel(response) {
	if (response.status > 300) {
		return false;
	}
	if (response.url.indexOf('data:') === 0) {
		return false;
	}
	if (response.status === 204) {
		return true;
	}
	if (response.contentType == 'image/gif' && response.bodySize < 100) {
		for (var i in response.headers) {
			if (response.headers[i]['name'] == 'Cache-Control') {
				if (response.headers[i]['value'].indexOf('no-cache') !== -1) {
					return true;
				}
			}
		}
	}
	return false;
}

var args = require('system').args;

if (args.length !== 2) {
	console.log('You need to pass a URL!');
	phantom.exit();
}

var url = args[1];
var page = require('webpage').create();

page.onResourceReceived = function(response) {
	if (response.stage === 'start') {
		if (isPixel(response)) {
			console.log(response.url)
		}
	}
}

// page.onResourceRequested = function(requestData, networkRequest) {
//     console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
// };

page.open(url, function () {
	console.log("Loaded...");
    phantom.exit();
});