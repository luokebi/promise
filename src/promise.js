function Promise(func) {
	var z = this;
	this._thens = [];

	function _resolve() {
		_process('resolve', arguments);
	}

	function _reject() {
		_process('reject', arguments);

	}

	function _process(type, args) {
		var args = Array.prototype.slice.call(args),
			o = z._thens.shift();

		if (type == 'resolve') {
			var f = o ? o.resolve : null;
		} else if (type == 'reject') {
			var f = o ? o.reject : null;
		}

		if (f) {
			try {
				var p = f.apply(null, args);

				if (p instanceof Promise) {
					p._thens = z._thens;
				} else {
					var promise = Promise.resolve(p);
					promise._thens = z._thens;
				}
			} catch (e) {
				return _reject(e);
			}
		}
	}

	setTimeout(function() {
		func.call(null, _resolve, _reject);
	});
}


Promise.prototype.then = function(resolve, reject) {
	this._thens.push({
		resolve: resolve,
		reject: reject
	});

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
	var l = len = promises.length,
	    defer = Promise.deferred(),
	    results = [];

	for (var i = 0; i < len; i++) {
		(function(i) {
			var p = promises[i];
			p.then(function(r) {
				results[i] = r;
				l--;

				if (l === 0) {
					defer.resolve(results);
				}
			});
		})(i);
	}

	return defer.promise;
};

Promise.any = function(promises) {
	var len = promises.length,
	    defer = Promise.deferred(),
	    results = [];

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
	defer.promise = new Promise(function(resolve, reject) {
		defer.resolve = resolve;
		defer.reject = reject;
	});

	return defer;
};