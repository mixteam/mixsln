(function(win, app, undef) {


function Content(wrapEl, options) {
	options || (options = {});

	this._wrapEl = wrapEl;
	this._cacheWrapEl = options.cacheWrapEl;
	this._cacheLength  = options.cacheLength;
	this._cacheIndex = 0;

	var cacheDomHtml = '';
	for (var i = 0; i < this._cacheLength; i++) {
		cacheDomHtml += '<div class="inactive"></div>';
	}
	this._cacheWrapEl.innerHTML = cacheDomHtml;

	this.getActive().className = 'active';
	this.getNext().className += ' next';
	this.getPrevious().className += ' prev';
}

var ContentProto = {
	getActive : function() {
		var index =  this._cacheIndex;
		return this._cacheWrapEl.querySelector('div:nth-child(' + (index + 1) + ')');
	},

	getNext: function() {
		var index = (this._cacheIndex + 1) % this._cacheLength;
		return this._cacheWrapEl.querySelector('div:nth-child(' + (index + 1) + ')');
	},

	getPrevious: function() {
		var index = (this._cacheIndex - 1 + this._cacheLength) % this._cacheLength;
		return this._cacheWrapEl.querySelector('div:nth-child(' + (index + 1) + ')');
	},

	next: function() {
		this.getNext().className = 'active';
		this.getActive().className = 'inactive prev';
		this.getPrevious().className = 'inactive';
		this._cacheIndex = (this._cacheIndex + 1) % this._cacheLength;
		this.getNext().className = 'inactive next';
	},

	previous: function() {
		this.getPrevious().className = 'active';
		this.getActive().className = 'inactive next';
		this.getNext().className = 'inactive';
		this._cacheIndex = (this._cacheIndex - 1 + this._cacheLength) % this._cacheLength;
		this.getPrevious().className = 'inactive prev';
	},

	html: function(html) {
		this.getActive().innerHTML = html;
	}
}

for (var p in ContentProto) {
	Content.prototype[p] = ContentProto[p];
}

app.module.Content = Content;

})(window, window['app']||(window['app']={module:{},plugin:{}}));