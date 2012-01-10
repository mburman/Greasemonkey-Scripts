//==UserScript==
//@name           News Headlines Ticker
//@namespace      http://mburman.github.com/Greasemonkey-Scripts/
//@description    Displays a scrolling link of news headlines from Google News on the Google Homepage
//@include        http://www.google.*
//@require         https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js
//==/UserScript==

(function(){
	var newsObj = [];
	function NewsItem(title, link) {
		this.title = title;
		this.link = link;
	}

	GM_xmlhttpRequest({
		method: "GET",
		url: "http://news.google.com/?output=rss",
		onload: function(response) {
			parseRSS(response);
			display();
			return;
		}
	});

	function parseRSS(response) {
		var titleMatch = "";
		var linkMatch = "";
		var regexp = /<item><title>(.*?)<\/title>/g;
		var link = /<link>(.*?)<\/link>/g;
		var special = /&apos;/g;

		while(true) {
			titleMatch = regexp.exec(response.responseText);

			if(titleMatch == null) {
				break;
			}

			titleMatch[1] = titleMatch[1].replace(special,"'");
			linkMatch = link.exec(response.responseText);
			newsObj.push(new NewsItem(titleMatch[1], linkMatch[1]));
		}

		for(var i = 0; i < newsObj.length; i++) {
			log(newsObj[i].title);
			log(newsObj[i].link);
		}

		return;
	}

	function display() {
		log("DONE");

		var $;

		//	Add jQuery
		if (typeof unsafeWindow.jQuery == 'undefined') {
			var GM_Head = document.getElementsByTagName('head')[0] || document.documentElement,
			GM_JQ = document.createElement('script');

			GM_JQ.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js';
			GM_JQ.type = 'text/javascript';
			GM_JQ.async = true;

			GM_Head.insertBefore(GM_JQ, GM_Head.firstChild);
		}
		GM_wait();

		// Check if jQuery's loaded
		function GM_wait() {
			if (typeof unsafeWindow.jQuery == 'undefined') {
				window.setTimeout(GM_wait, 100);
			} else {
				$ = unsafeWindow.jQuery.noConflict(true);
				letsJQuery();
			}
		}

		// jQuery dependent code
		function letsJQuery() {
			log($().jquery); // check jQuery version

			var footDiv = '<div id="myfoot" style="display:block;width:100%;height:100px;background:#000">Code Injection</div>'
				$('#body').append(footDiv);
		}

	}


	function log(val) {
		unsafeWindow.console.log(val);
	}

})();
