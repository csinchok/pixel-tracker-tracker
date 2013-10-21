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
var url;
var exclusions = [];
if (args.length !== 2) {
	if(args[1] === "-e" || args.length === 4) {
		var stream = require('fs').open(args[2], "r");
		var line = stream.readLine();
		while(line !== "") {
			exclusions.push(line);
			line = stream.readLine();
		}
		url = args[3];
	} else {
		console.log('USAGE: capure.js [-e path] [url]');
		phantom.exit();
	}
} else {
	url = args[1];
}


var page = require('webpage').create();
page.settings.userAgent = "Pixel Tracker Tracker";

page.onResourceRequested = function(requestData, networkRequest) {
	for(var i in exclusions) {
		if(requestData.url.indexOf(exclusions[i]) !== -1) {
			console.log(requestData.url);
			networkRequest.abort();
			return;
		}
	}
};

page.onResourceReceived = function(response) {
	if (response.stage === 'start') {
		if (isPixel(response)) {
			console.log(response.url);
		}
	}
}

page.open(url, function () {
    phantom.exit();
});