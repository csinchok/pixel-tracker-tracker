var ES_URL = "http://localhost:9200/ptt/crawl/_search";

function updateStats(url) {
	var query = {
		"query": {
			"match": {
				"url": url
			}
		},
		"facets": {
			"stat" : {
				"statistical": {
					"field": "count"
				}
			}
		}
	};

	$.post(ES_URL, JSON.stringify(query), function(data){
		console.log(data);
		$("[href='/detail.html?url=" + url + "'] .badge").html(data.facets.stat.mean);
	});
}

function buildDetail() {
	var parsed = parseUri(document.location);
	var url = parsed.queryKey.url;
	var query = {
		"sort": {
			"date": {"order" : "desc"}
		},
		"query": {
			"match": {
				"url": url
			}
		},
		"facets": {
			"stat" : {
				"statistical": {
					"field": "count"
				}
			}
		}
	};
	$.post(ES_URL, JSON.stringify(query), function(data){
		var title = $('<h3><a href="' + url + '">' + url + '</a> <span class="label label-default">' + data.facets.stat.mean + '</span></h3>');
		$(".container").append(title);

		for(var i in data.hits.hits) {
			var crawl = data.hits.hits[i];
			var parsedDate = moment.utc(crawl['_source'].date).format("MMMM Do, h:mm a");
			var panel = $('<div class="panel panel-default"><div class="panel-heading">' + parsedDate + ' <span class="badge">' + crawl['_source'].count + '</span></div><ul class="list-group"></ul></div>')
			for(var j in crawl['_source'].trackers) {
				if(crawl['_source'].trackers[j] != "") {
					panel.find('.list-group').append('<li class="list-group-item">' + crawl['_source'].trackers[j] + '</li>');
				}
			}
			$(".container").append(panel);
		}
	});
}

function buildIndex() {
	var query = {
		"query" : { "match_all" : {} },
		"facets" : {
			"urls" : { "terms" : {"field" : "url", "all_terms": true} }
		}
	};

	$.post(ES_URL, JSON.stringify(query), function(data){
		for(var i in data.facets.urls.terms) {

			var url = data.facets.urls.terms[i].term;
			var el = $('<a class="list-group-item" href="/detail.html?url=' + url + '"><span class="badge">?</span>' + url + '</a>');
			$(".sites").append(el);
		}
		for(var i in data.facets.urls.terms) {
			updateStats(data.facets.urls.terms[i].term);
		}
	});
}