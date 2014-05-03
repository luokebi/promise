function Promise(func) {
	var z = this;
	this._thens = [];

	function resolve() {
		var args = Array.prototype.slice.call(arguments);
		var fun = z._thens.shift();

		if (fun) {
			var p = fun.apply(null, args);

			if (p instanceof Promise) {
				p._thens = z._thens;
			} else {
				var promise = new Promise(function(resolve) {
					setTimeout(function() {
						resolve(p);
					});
				});

				promise._thens = z._thens;
			}
		}
	}

	func.call(null, resolve);
}


Promise.prototype.then = function(fun) {
	this._thens.push(fun);

	return this;
};

Promise.resolve = function() {
	var args = Array.prototype.slice.call(arguments);

	var promise = new Promise(function(resolve) {
		resolve.apply(null, args);
	});

	return promise;
};

Promise.all = function(promises) {
	var len = promises.length;
	var defer = Promise.deferred();
	var results = [];

	for (var i = 0; i < len; i++) {
		(function(i) {
			var p = promises[i];
			p.then(function(r) {
				results[i] = r;

				if (results.length === len) {
					defer.resolve(results);
				}
			});
		})(i);
	}

	return defer.promise;
};

Promise.any = function(promises) {
	var len = promises.length;
	var defer = Promise.deferred();
	var results = [];

	for (var i = 0; i < len; i++) {
		(function(i) {
			var p = promises[i];
			p.then(function(r) {
				results[i] = r;

				if (results.length > 0) {
					defer.resolve(r);
				}
			});
		})(i);
	}

	return defer.promise;
};

Promise.queue = function(funcs) {
	var temp_p = funcs[0]();

	for (var i = 1, len = funcs.length; i < len; i++) {
		(function(i) {
			temp_p.then(funcs[i]);
		})(i);
	}

	return temp_p;
};

Promise.deferred = function() {
	var defer = {};
	defer.promise = new Promise(function(resolve) {
		defer.resolve = resolve;
	});

	return defer;
};