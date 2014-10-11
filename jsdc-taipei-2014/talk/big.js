window.onload = function() {
    var s = document.getElementsByTagName('div'), cur = 0;
    if (!s) return;
	function go(n) {
		cur = n;
		var idealTextSize = 14;
		var i = Math.pow(1.918, 8)*idealTextSize;
		var e = s[n];
		for (var k = 0; k < s.length; k++) s[k].style.display = 'none';
		e.style.display = 'inline';
		e.style.fontSize = i + 'px';
		if (e.firstChild.firstChild.nodeName.toLowerCase() === 'img') {
			if ( e.firstChild.firstChild.title == "background" ) {
				document.body.style.background = 'url(' + e.firstChild.firstChild.src + ') no-repeat';
				e.firstChild.firstChild.style.display = 'none';
			} else {
				if ( e.firstChild.firstChild.title == "border" ) {
					e.firstChild.firstChild.className = "border";
				}
				document.body.style.backgroundImage = '';
			}
		} else {
			document.body.style.backgroundImage = '';
		}
		while ( e.offsetWidth > window.innerWidth/1.1 || e.offsetHeight > window.innerHeight/1.5 ) {
			e.style.fontSize = (i -= i/1.9180339887498948482045868343656381177203091798057628) + 'px';
			// console.log(e.style.fontSize);
			e.style.left = ( window.innerWidth - e.offsetWidth )/2 + 'px';
			e.style.top = ( window.innerHeight - e.offsetHeight )/2 + 'px';
		}
		e.style.fontSize = Math.round(e.style.fontSize);	//	Round to nearest whole number
		if (window.location.hash !== n) window.location.hash = n;
		document.title = e.textContent || e.innerText;
	}
	document.onkeydown = function(e) {
		(e.which === 39) && go(Math.min(s.length - 1, ++cur));
		(e.which === 37) && go(Math.max(0, --cur));
	};
	function parse_hash() {
		return Math.max( Math.min( s.length - 1, parseInt(window.location.hash.substring(1), 10)), 0);
	};
	if (window.location.hash) cur = parse_hash() || cur;
	window.onhashchange = function() {
		var c = parse_hash();
		if (c !== cur) go(c);
	};

	go(cur);
};
