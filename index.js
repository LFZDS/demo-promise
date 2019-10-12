function Promise(fn) {
    this._state = 0;
    this._deferredState = 0;
    this._value = null;
    this._deferreds = [];
    doResolve(this, fn);
}

Promise.prototype.then = function (onFulfilled, onRejected) {
    handle(this, {
        onFulfilled: onFulfilled,
        onRejected: onRejected
    })
};

function handle(self, deferred) {
    while (self._state === 3) {
        self = self._value;
    }

    if (self._state === 0) {
        if (self._deferredState === 0) {
            self._deferredState = 1;
            self._deferreds = deferred;
            return;
        }
        if (self._deferredState === 1) {
            self._deferredState = 2;
            self._deferreds = [self._deferreds, deferred];
            return;
        }
        self._deferreds.push(deferred);
        return;
    }
    handleResolved(self, deferred);
}

function handleResolved(self, deferred) {
        var fn = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
        var ret = fn(self._value);

}

function doResolve(self, fn) {
    fn(
        function (value) {
            resolve(self, value);
        },
        function (value) {
            reject(self, value);
        }
    )
}

function resolve(self, newValue) {
    if (newValue && newValue.then && newValue instanceof Promise) {
        self._value = newValue;
        self._state = 3;
        finale(self);
        return;
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
}

function reject(self, value) {
    self._state = 2;
    self._value = value;
}

function finale(self) {
    if (self._deferredState === 1) {
        handle(self, self._deferreds);
        self._deferreds = null;
    }
    if (self._deferredState === 2) {
        for (var i = 0; i < self._deferreds.length; i++) {
            handle(self, self._deferreds[i]);
        }
        self._deferreds = null;
    }
}
var pronext = new Promise(function (resolve, reject) {
    setTimeout(function () {
        console.log('我是嵌套的');
        resolve('我是嵌套的resolve');
    }, 6000);
});
pronext.then(function (res) {
    console.log('我是嵌套的then', res);
});

var pro = new Promise(function (resolve, reject) {
    setTimeout(function () {
        console.log('我是第一层resolve');
        resolve(pronext);
    }, 3000);
});

pro.then(
    function (res) {
        console.log(res, '我是第一层then');
        return function (resolve, reject) {
            console.log('return再来一下');
        }
    },
    function (err) {
        console.log(err, 'err');
    }
)
