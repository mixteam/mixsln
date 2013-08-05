;(function(win, app, undef) {


function Content(wrapEl, options) {
	options || (options = {});
	this._wrapEl = wrapEl;
	this._cacheLength = Math.max(options.cacheLength, 1);
	this._cacheIndex = 0;

	var html = '';
	for (var i = 0; i < this._cacheLength; i++) {
		html += '<div class="inactive" index="' + i + '"></div>';
	}
	this._wrapEl.innerHTML = '<div class="wrap">' + html + '</div><div class="loading"><div></div><div></div></div>';
	this.contentEl = this._wrapEl.childNodes[0];
	this.loadingEl = this._wrapEl.childNodes[1];
	this.loadingShadeEl = this.loadingEl.childNodes[0];
	this.loadingItemEl = this.loadingEl.childNodes[1];

	this.setClassName();
}

var ContentProto = {
	setClassName: function() {
		this.getActive().className = 'active';
		if (this._cacheLength > 2) {
			this.getPrevious().className = 'inactive prev';
			this.getNext().className = 'inactive next';
		} else if (this._cacheLength > 1){
			this.getPrevious().className = 'inactive';
		}
	},

	showLoading: function(text) {
		var wrapRect, spanRect;

		this.loadingEl.style.display = 'block';

		if (text) {
			this.loadingItemEl.innerHTML = text;
			this.loadingItemEl.style.display = 'block';
			wrapRect = this._wrapEl.getBoundingClientRect();
			spanRect = this.loadingItemEl.getBoundingClientRect();
			this.loadingItemEl.style.left = (wrapRect.width - spanRect.width) / 2 + 'px';
			this.loadingItemEl.style.top = ((window.innerHeight - spanRect.height) / 2 - wrapRect.top) + 'px';
		}
	},

	hideLoading: function() {
		this.loadingEl.style.display = '';
		this.loadingItemEl.style.cssText = '';
	},

	getActive : function() {
		var index = this._cacheIndex;
		return this.contentEl.childNodes[index];
	},

	getNext: function() {
		var index = (this._cacheIndex + 1) % this._cacheLength;
		return this.contentEl.childNodes[index];
	},

	getPrevious: function() {
		var index = (this._cacheIndex - 1 + this._cacheLength) % this._cacheLength;
		return this.contentEl.childNodes[index];
	},

	next: function() {
		if (this._cacheLength > 2) {
			this.getPrevious().className = 'inactive';
		}
		this._cacheIndex = (this._cacheIndex + 1) % this._cacheLength;
	},

	previous: function() {
		if (this._cacheLength > 2) {
			this.getNext().className = 'inactive';
		}
		this._cacheIndex = (this._cacheIndex - 1 + this._cacheLength) % this._cacheLength;
	},

	html: function(html) {
		this.getActive().innerHTML = html;
	}
}

for (var p in ContentProto) {
	Content.prototype[p] = ContentProto[p];
}

app.module.Content = Content;

})(window, window['app']||(window['app']={module:{},plugin:{}}))