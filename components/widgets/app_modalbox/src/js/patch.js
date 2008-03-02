Modalbox._setWidthAndPosition = function () {
	$(this.MBwindow).setStyle({width: this.options.width + "px"});
	var f = this._setPosition.bind(this);
	setTimeout(f, 1);
};