import subprocess
import datetime
from pyelasticsearch import ElasticSearch
from pyelasticsearch.exceptions import IndexAlreadyExistsError

es = ElasticSearch('http://localhost:9200/')
try:
	es.create_index("ptt")
except IndexAlreadyExistsError:
	pass
es.put_mapping("ptt", "crawl", {
	"crawl": {
		"properties": {
			"url" : {"type" : "string", "index" : "not_analyzed"},
			"date": {"type" : "date"},
			"count": {"type": "integer"},
			"trackers": {"type": "string"}
		}
	}
})

URLS_TO_CRAWL = [
	"http://www.theonion.com",
	"http://www.buzzfeed.com",
	"http://www.funnyordie.com",
	"http://www.collegehumor.com",
	"http://www.reddit.com",
	"http://www.cnn.com",
	"http://www.huffingtonpost.com",
	"http://www.nytimes.com",
	"http://www.bbc.co.uk/news/",
	"http://www.foxnews.com",
	"http://www.theguardian.com/us",
	"http://www.time.com/time/",
	"http://www.usatoday.com",
	"http://qz.com"
]


for url in URLS_TO_CRAWL:
	output = subprocess.check_output(["phantomjs", "capture.js", "-e", "known-trackers.txt", url])
	trackers = output.strip().split("\n")
	data = {
		"date": datetime.datetime.now(),
		"url": url,
		"count": len(trackers),
		"trackers": trackers
	}
	es.index("ptt", "crawl", data)