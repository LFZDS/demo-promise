function Promise(fn) {
    var self = this;
    this.status = 'pending';
    this.value = null;
    this.reason = null;
    this.onFulfilledCallBacks = [];
    this.onRejectedCallBacks = [];

    try {
        fn(resolve, reject);
    } catch (err) {
        reject(err);
    }

    function resolve(value) {
        if (self.status === 'pending') {
            self.status = 'fulfilled';

            if (value instanceof MyPromise) {
                value.then(val => {
                    self.value = val
                    self.onFulfilledCallBacks.forEach(function (cb) {
                        cb(self.value);
                    });
                }, err => {
                    self.value = err
                    self.onRejectedCallBacks.forEach(function (cb) {
                        cb(self.value);
                    });
                })
            } else {
                self.value = val
                self.onRejectedCallBacks.forEach(function (cb) {
                    cb(self.value);
                });
            } else {
                self.value = value;
                self.onFulfilledCallBacks.forEach(function (cb) {
                    cb(self.value);
                });
            }
        }
    }

    function reject(reason) {
        if (self.status === 'pending') {
            self.status = 'rejected';
            self.reason = reason;

            self.onRejectedCallBacks.forEach(function (cb) {
                cb(self.reason);
            });
        }
    }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
    var self = this;

    if (typeof onFulfilled !== 'function') {
        onFulfilled = function (val) {
            return val;
        }
    }

    if (typeof onRejected !== 'function') {
        onRejected = function (reason) {
            throw reason;
        }
    }

    var newPromise = new Promise(function (resolve, reject) {
        if (self.status === 'fulfilled') {
            setTimeout(function () {
                try {
                    var x = onFulfilled(self.value);
                    promiseResolveProcedure(newPromise, x, resolve, reject);
                } catch (err) {
                    reject(err);
                }
            }, 0);

        } else if (self.status === 'rejected') {
            setTimeout(function () {
                try {
                    var x = onRejected(self.reason);
                    promiseResolveProcedure(newPromise, x, resolve, reject);
                } catch (err) {
                    reject(err);
                }
            }, 0);

        } else if (self.status === 'pending') {
            self.onFulfilledCallBacks.push(function (value) {
                setTimeout(function () {
                    try {
                        var x = onFulfilled(value);
                        promiseResolveProcedure(newPromise, x, resolve, reject);
                    } catch (err) {
                        reject(err);
                    }
                }, 0);
            });
            self.onRejectedCallBacks.push(function (reason) {
                setTimeout(function () {
                    try {
                        var x = onRejected(reason);
                        promiseResolveProcedure(newPromise, x, resolve, reject);
                    } catch (err) {
                        reject(err);
                    }
                }, 0);
            });
        }
    });
    return newPromise;
};


function promiseResolveProcedure(promise, x, resolve, reject) {
    if (promise === x) {
        reject(new TypeError('循环引用'));
    }

    if (x !== null && (typeof x === "object" || typeof x === "function")) {
        var then;
        var called;

        try {
            then = x.then;
            if (typeof then === "function") {
                try {
                    then.call(x, function (y) {
                        console.log(called, 'called');
                        if (!called) {
                            called = true;
                        }
                        promiseResolveProcedure(promise, y, resolve, reject);
                    }, function (r) {
                        console.log(called);
                        if (!called) {
                            called = true;
                        }
                        reject(r);
                    })
                } catch (err) {
                    if (!called) {
                        called = true;
                    }
                    reject(err);
                }
            } else {
                resolve(x);
            }
        } catch (e) {
            if (called) {
                return;
            }
            reject(e)
        }
    } else {
        resolve(x);
    }
}


Promise.prototype.catch = function (reject) {
    // 调用promise的then方法获取错误原因
    return this.then(null, reject)
};


Promise.all = function (promises) {
   const count = promises.length;
   const results = [];
   return new Promise(function (resolve, reject) {
       promises.forEach(function (item, index) {

           function handle(item, index) {
               results[index] = item;
               if (results.length === count) {
                   resolve(results);
               }
           }
           if (!item instanceof Promise) {
               handle(item, index);
           } else {
               item.then(function (value) {
                   handle(value, index);
               }, function (e) {
                   reject(e)
               })
           }

       })
   });
};


Promise.race = function (promises) {
    return new Promise(function (resolve, reject) {
        promises.forEach(function (item, index) {
            if (!item instanceof Promise) {
                resolve(item);
            } else {
                item.then(function (value) {
                    resolve(value);
                }, function (e) {
                    reject(e)
                })
            }

        })
    });
};

Promise.prototype.finally = function (callback) {
    let P = this.constructor;
    return this.then(
        value  => P.resolve(callback()).then(() => value),
        reason => P.resolve(callback()).then(() => { throw reason })
);
// https://segmentfault.com/q/1010000011285054
// 可能怕callback报错才多包一层P.resolve？

Promise.resolve = function (value) {
    return new Promise(function (resolve, reject) {
        resolve(value);
    })
};

Promise.reject = function (reason) {
    return new Promise(function (resolve, reject) {
        reject(reason);
    })
};

// var promise2 = new Promise(function (resolve, reject) {
//     resolve(11);
// }).then(function (value) {
//     return promise2;
// }, function (reason) {
//     console.log(reason);
// });
promise2.then(11)
promise2.then(11)
promise2.then(11)

var promise2 = new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve(11);
    }, 100);
}).then(function (value) {
    return new Promise(function (resolve, reject) {
        resolve('diyici');
    });
}, function (reason) {
    // throw reason;
    return new Promise(function (resolve, reject) {
        resolve('reject returen');
    });
}).then(function (val2) {
    console.log(val2);
    return 2121;
}).catch(function (reasion) {
    return 'catch return';
}).then(function (val) {
}, function (e) {
});

