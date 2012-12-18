"use strict";

function NewsSlider(startDate, endDate, duration) {
	var date; 
	
	this.duration = duration;	
	this.startDate = Date.parse(startDate);
	this.endDate = Date.parse(endDate);
	if (Date.today().between(this.startDate, this.endDate)) {
 		this.endDate = Date.today();
	}	
	this.dateRange = [];
	this.coversQueue = new Queue();
	
	date = this.startDate;
	while (date.between(this.startDate, this.endDate)) {
		this.dateRange.push(date.toString("yyyy/MM/dd"));
		date.add(1).days();
	}
	
	this.loadCovers();
	this.runLoop();
}

NewsSlider.prototype.loadCovers = function() {
	$.preload(this.dateRange, {
		base:'http://www.nytimes.com/images/',
    	ext:'/nytfrontpage/scan.jpg',
    	onComplete: $.proxy(this.queueCover, this),
    	threshold: 1
	});
}

NewsSlider.prototype.queueCover = function(options) {
	var selector = (options.index % 2) ? ".odd" : ".even",
		previous = (options.index % 2) ? ".even" : ".odd";
	this.coversQueue.enqueue({
		url: options.image,
		selector: selector,
		previous: previous,
		index: options.index,
		date: options.original
	});
}

NewsSlider.prototype.runLoop = function() {
	if (!this.coversQueue.isEmpty()) {
		this.changeCover(this.coversQueue.dequeue());
		setTimeout($.proxy(this.runLoop, this), this.duration);
	} else {
		setTimeout($.proxy(this.runLoop, this), this.duration / 5);			
	}
}

NewsSlider.prototype.changeCover = function(cover) {
	this.renderCover(cover);
	this.renderCalendar(cover)
}

NewsSlider.prototype.renderCover = function(cover) {
	var selector = ".cover" + cover.selector, 
		previous = ".cover" + cover.previous, 
		zIndex = cover.index,
		url = cover.url;
	$(selector).css("background-image", "url("+url+")");
	$(selector).css("z-index", zIndex);
	$(selector).addClass("show");
	setTimeout( function(){
		$(previous).removeClass("show")
	}, this.duration / 2);
}
	
NewsSlider.prototype.renderCalendar = function(cover) {
	var selector = ".date" + cover.selector, 
		previous = ".date" + cover.previous, 
		zIndex = 400 - cover.index,
		date = Date.parse(cover.date);
	$(selector).show();
	$(selector + " h1").html(date.toString("dddd"));
	$(selector + " h2").html(date.toString("MMMM"));
	$(selector + " .number").html(date.toString("d"));
	$(previous).addClass("hide");
	setTimeout(function(){
		$(previous).hide();
		$(previous).removeClass("hide");
		$(previous).css("z-index", zIndex);
	}, this.duration / 2);
}


