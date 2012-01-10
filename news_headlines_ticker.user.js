// ==UserScript==
// @name           Google News Headline Ticker
// @author		   Manish Burman
// @namespace      http://mburman.github.com/Greasemonkey-Scripts/
// @description    Displays a news ticker from Google News on the Google Home Page below the search bar
// @include        http://www.google.*
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js
// ==/UserScript==

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

		// skip 2
		linkMatch = link.exec(response.responseText);
		linkMatch = link.exec(response.responseText);

		while(true) {
			titleMatch = regexp.exec(response.responseText);

			if(titleMatch == null) {
				break;
			}

			titleMatch[1] = titleMatch[1].replace(special,"'");
			linkMatch = link.exec(response.responseText);
			newsObj.push(new NewsItem(titleMatch[1], linkMatch[1]));
		}

		return;
	}

	function display() {


		GM_addStyle((<><![CDATA[
		#ticker {
			background-color: #ebebeb;
			border: 1px solid #ccc;
			padding: 20px;
			display:none;
		}

		ul {
			text-align: center;
		}

		#ticker > ul > li{
			display:none;
			color: #333;
			font: bold 14px "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans",
			"Geneva", "Verdana", "sans-serif";
			line-height: 1;
			padding: 8px 0;
			text-align: center;
			text-shadow: 0 1px 0 #eee;

		}

		#ticker > ul > li > a {
			color: #013ADF;
		}

		#ticker > ul > li > a:visited {
			color: #013ADF;
		}

		#ticker > ul#news {
			list-style: none;
			margin: 0;
			padding: 0;
		}

		#ticker > ul#news li {
			margin: 0;
		}
		]]></>).toString());

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
			var newsString = "";
			for (var cnt = 0; cnt < newsObj.length; cnt++) {
				newsString += "<li><a href=\""+newsObj[cnt].link+"\">"+newsObj[cnt].title+"</a></li>";
			}

			var tickerDiv = '<div id="ticker"><ul id="news">'+newsString+'</ul></div>';

			$('#body').append(tickerDiv);
			$('#ticker').fadeIn('slow');
			$('ul > li').eq(0).fadeIn('slow');

			var cnt = 0;
			setInterval(animateList, 2500);

			function animateList() {
				$('ul > li').eq(cnt).fadeOut('fast', function() {
					cnt = (++cnt)%newsObj.length;
					$('ul > li').eq(cnt).fadeIn('fast', function() {
					});
				});
			}
		}
	}

})();
