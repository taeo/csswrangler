javascript:(function(){
	if(window.csswrangler===undefined) {
		var csswranglerLoader = document.createElement('script');
		csswranglerLoader.type = 'text/javascript';
		csswranglerLoader.id = 'CSSWRANGLERLOADER';
		csswranglerLoader.src = 'http://static.csswrangler.dev/script/bookmarklet.js';
		(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(csswranglerLoader);
	}
})();