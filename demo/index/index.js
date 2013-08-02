	(function() {
		var doc = document,
			$ = function(s, p) {return (p||doc).querySelectorAll(s)};

		var	eImgList = $('.imglist')[0], eImgs = $('.img', eImgList),
			eIn = $('.in')[0], eInSpan = $('span', eIn),
			itemIndex = 0, itemLen = eInSpan.length, 
			itemPadding = 13, itemWidth = 306, 
			slideTimeid = null, stoped = false;
			;

		eImgList.style.width = (eImgList.offsetWidth + itemPadding * (itemLen - 1)) + 'px';
		eImgList.addEventListener('webkitTransitionEnd', function() {
			eImgList.style.webkitTransition = '';
			startSlide();
		});

		function slide() {
			var x = (itemWidth + itemPadding) * itemIndex;	
			eImgList.style.webkitTransition = '-webkit-transform 0.4s ease 0s';
			eImgList.style.webkitTransform = 'translateX(-' + x + 'px)';
			$('span.cur', eIn)[0].className = '';
			eInSpan[itemIndex].className = 'cur';
		}

		function startSlide() {
			stoped = false;
			slideTimeid = setTimeout(function() {
				if (!stoped) {
					itemIndex = (itemIndex + 1) % itemLen;
					slide();
				}
			}, 2000);
		}
		function stopSlide() {
			var x = getTransformOffset(eImgList).x;
			eImgList.style.webkitTransition = '';
			eImgList.style.webkitTransform = 'translateX(' + x + 'px)';
			stoped = true;
			clearTimeout(slideTimeid);
		}
		startSlide();


		var MATRIX3D_REG = /^matrix3d\(\d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, ([-\d.]+), ([-\d.]+), [-\d.]+, \d+\)/,
			MATRIX_REG = /^matrix\(\d+, \d+, \d+, \d+, ([-\d.]+), ([-\d.]+)\)$/,
			stratOffset, panRatio, maxOffset, prevent = false;
	    function getTransformOffset(el) {
		    var offset = {
		    		x: 0,
		    		y: 0
		    	}, 
		    	transform = getComputedStyle(el).webkitTransform, 
		    	matchs, reg;

		    if (transform !== 'none') {
		    	reg = transform.indexOf('matrix3d') > -1 ? MATRIX3D_REG : MATRIX_REG;
		        if((matchs = transform.match(reg))) {
		            offset.x = parseInt(matchs[1]) || 0;
		            offset.y = parseInt(matchs[2]) || 0;
		        }
		    }

		    return offset;
	    }
		eImgList.addEventListener('touchstart', function(e) {
			prevent = false;
			stopSlide();
		}, false);
		eImgList.addEventListener('horizontalpanstart', function(e) {
			prevent = true;
			startOffset = getTransformOffset(eImgList);
			panRatio = 2.5;
			maxOffset = {x:- (itemWidth + itemPadding) * (itemLen - 1), y:0}
		}, false);
		eImgList.addEventListener('touchmove', function(e) {
			prevent && e.preventDefault();
		})
		eImgList.addEventListener('horizontalpan', function(e) {
			e.preventDefault();
			var x = startOffset.x + e.displacementX
				;

		    if(x > 0) {
		    	x = x / panRatio;
		    	panRatio *= 1.003;
		    } else if(x < maxOffset.x) {
		    	x = maxOffset.x - (maxOffset.x - x) / panRatio;
		    	panRatio *= 1.003;
		    }
		   	panRatio > 4 && (panRatio = 4);

		    eImgList.style.webkitTransition = '';
		    eImgList.style.webkitTransform = 'translateX(' + x + 'px)';
		}, false);
		eImgList.addEventListener('panend', function(e) {
			var x = getTransformOffset(eImgList).x
				;

			if (x > 0 || x < maxOffset.x) {
				slide();
			} else {
				itemIndex = Math.round(-x / (itemWidth + itemPadding));
				slide();
			}
		}, false);
		eImgList.addEventListener('horizontalflick', function(e) {
			if (e.displacementX < 0) { //next
				++itemIndex === itemLen && (itemIndex = itemLen - 1);
				slide();
			} else { // prev
				--itemIndex < 0 && (itemIndex = 0);
				slide();
			}
		});
		eImgList.addEventListener('touchend', function(e) {

		}, false);


		var startScrollTime, endScrollTime, isIOS = (/iphone|ipad/gi).test(navigator.appVersion);
		function lazyload() {
			var imgs = $('.img[data-background-image]'),
				ch = doc.documentElement.clientHeight;

			Array.prototype.forEach.call(imgs, function(img) {
				var rect = img.getBoundingClientRect();
				if (rect.bottom > 0 && rect.top < ch) {
					img.style.backgroundImage = 'url(' + img.getAttribute('data-background-image') + ')';
					img.removeAttribute('data-background-image');
				}
			});
		}
		if (isIOS) {
			window.addEventListener('scroll', lazyload, false);
		} else {
			doc.addEventListener('touchstart', function() {
				startScrollTime = Date.now();
			});
			doc.addEventListener('touchend', function() {
				endScrollTime = Date.now();
				if (endScrollTime - startScrollTime < 200) {
					var y = window.scrollY,
						id = setInterval(function(){
							if (y === window.scrollY) {
								clearInterval(id);
								lazyload();
							} else {
								y = window.scrollY
							}
						}, 50);
				} else {
					lazyload();
				}
			});
		}
		lazyload();
	})();