var Counter = (function Counter(){

	var that = Object.create(Counter.prototype);

	var mongoose = require("mongoose");
	var counterSchema = mongoose.Schema({
		count: Number
	});
	var CounterModel = mongoose.model("CounterModel", counterSchema);

	that.getCount = function(callback){
		CounterModel.findOne({}, function(err, doc){
			if (err){
				callback(true);
			} else {
				callback(false, doc.count);
			}
		});
	};

	that.increment = function(callback){
		CounterModel.findOne({}, function (err, doc){
		  doc.count = doc.count + 1 ;
		  doc.save();
		  if (err){
		  	callback(true);
		  } else {
		  	callback(false, doc);
		  }
		});
	};

	that.initialize = function(callback){
		CounterModel.remove({}, function(err){
			CounterModel.create({count: 0}, function(err, record){
				if (err){
					callback(err);
				} else {
					callback(null, record);
				}
			});
		});
	};


	Object.freeze(that);
	return that;
})();


module.exports = Counter;