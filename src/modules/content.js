(function(win, app, undef) {


function Content(wrapEl, options) {
	options || (options = {});
	this._wrapEl = wrapEl;
	this._cacheLength = Math.max(options.cacheLength, 1);
	this._cacheIndex = 0;

	var html = '';
	for (var i = 0; i < this._cacheLength; i++) {
		html += '<div class="inactive" index="' + i + '"></div>';
	}
	this._wrapEl.innerHTML = '<div class="wrap">' + html + '</div>';

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

	getActive : function() {
		var index = this._cacheIndex;
		return this._wrapEl.querySelector('.wrap > div:nth-child(' + (index + 1) + ')');
	},

	getNext: function() {
		var index = (this._cacheIndex + 1) % this._cacheLength;
		return this._wrapEl.querySelector('.wrap > div:nth-child(' + (index + 1) + ')');
	},

	getPrevious: function() {
		var index = (this._cacheIndex - 1 + this._cacheLength) % this._cacheLength;
		return this._wrapEl.querySelector('.wrap > div:nth-child(' + (index + 1) + ')');
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

})(window, window['app']||(window['app']={module:{},plugin:{}}));