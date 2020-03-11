
// promise接受一个fn回调函数
function Promise(fn) {
    var self = this;
    this.status = 'pending';     // 三种状态：pending  fulfilled rejected
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
        /**
         * 2.1.1.1
         * When pending, a promise:
         * may transition to either the fulfilled or rejected state.
         * pending状态可以转换成fulfilled或者rejected状态
         */

        /**
         * 2.2.2.3
         * it must not be called more than once.
         * 只能调用一次
         */
        if (self.status === 'pending') {
            self.status = 'fulfilled';
            self.value = value;

            /**
             * 2.2.6.1
             * if/when promise is fulfilled, all respective onFulfilled callbacks must execute in the order of their originating calls to then.
             * 如果promise执行成功，所有的onFulfilled必须按照它注册的顺序执行
             */
            self.onFulfilledCallBacks.forEach(function (cb) {
                cb(self.value);
            });
        }
    }


    function reject(reason) {
        /**
         * 2.1.1.1
         * When pending, a promise:
         * may transition to either the fulfilled or rejected state.
         * pending状态可以转换成fulfilled或者rejected状态
         */

        /**
         * 2.2.2.3
         * it must not be called more than once.
         * 只能调用一次
         */
        if (self.status === 'pending') {
            self.status = 'rejected';
            self.reason = reason;
            /**
             * 2.2.6.2
             * if/when promise is rejected, all respective onRejected callbacks must execute in the order of their originating calls to then.
             * 如果promise执行错误，所有的onRejected必须按照它注册的顺序执行
             */
            self.onRejectedCallBacks.forEach(function (cb) {
                cb(self.reason);
            });
        }
    }
}


/**
 * 2.2
 * A promise must provide a then method to access its current or eventual value or reason.
 * A promise’s then method accepts two arguments:
 * 一个promise必须提供一个then方法来访问它当前的或最终的值以及原因(错误原因)
 * 一个promise的then方法接收两个参数
 */
Promise.prototype.then = function (onFulfilled, onRejected) {
    var self = this;
    /**
     * 2.2.1
     * Both onFulfilled and onRejected are optional arguments:
     * onFulfilled和onRejected是可选参数
     */

    /**
     * 2.2.1.1
     * If onFulfilled is not a function, it must be ignored.
     * 如果onFulfilled不是一个方法，必须忽略它
     */
    if (typeof onFulfilled !== 'function') {
        /**
         * 2.2.7.3
         * If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1.
         * 如果onFulfilled不是一个funciton并且promise是成功状态，则promise2必须以promise1的值作为fulfilled的返回值
         */
        onFulfilled = function (val) {
            return val;
        }
    }
    /**
     * 2.2.1.2
     * If onRejected is not a function, it must be ignored.
     * 如果onRejected不是一个方法，必须忽略它
     */
    if (typeof onRejected !== 'function') {
        /**
         * 2.2.7.4
         * if onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason as promise1.
         * 如果onRejected不是一个function，并且promise1是失败状态，promise2必须以promise1的失败原因作为rejected的返回原因
         */
        onRejected = function (reason) {
            throw reason;
        }
    }

    // 处理三种实例状态
    /**
     * 2.2.7
     * then must return a promise
     * then必须返回一个promise(为了链式调用)
     */
    var promise2 = new Promise(function (resolve, reject) {
        if (this.status === 'fulfilled') {
            // fulfilled
            // setTimeout 异步调用
            setTimeout(function () {
                try {
                    /**
                     * 2.2.2.1
                     * it must be called after promise is fulfilled, with promise’s value as its first argument.
                     * 它必须在promise是成功状态后以promise的值作为第一个参数被调用
                     */
                    var x = onFulfilled(self.value);

                    /**
                     * 2.2.7.1
                     * If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x).
                     * 当 onFulfille 或者 onRejected返回一个值，执行promiseResolveProcedure方法
                     */
                     promiseResolveProcedure(promise2, x, resolve, reject);
                } catch (err) {
                    /**
                     * 2.2.7.2
                     * If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.
                     * 当 onFulfilled 或者 onRejected 抛出了一个异常e，promise2 应当以e为reason拒绝
                     */
                    reject(err);
                }
            });

        } else if (this.status === 'rejected') {
            // rejected
            setTimeout(function () {
                try {
                    /**
                     * 2.2.3.1
                     * it must be called after promise is rejected, with promise’s value as its first argument.
                     * 它必须在promise是失败状态后以promise的错误原因作为第一个参数被调用
                     */
                    var x = onRejected(self.reason);
                    /**
                     * 2.2.7.1
                     */
                    promiseResolveProcedure(promise2, x, resolve, reject);
                } catch (err) {
                    /**
                     * 2.2.7.2
                     */
                    reject(err);
                }
            });

        } else if (this.status === 'pending') {
            // pending
            /**
             * 2.2.6
             * then may be called multiple times on the same promise.
             * then 能被相同的promise多次调用
             */
            this.onFulfilledCallBacks.push(function (value) {
                setTimeout(function () {
                    try {
                        /**
                         * 2.2.2.1
                         * it must be called after promise is fulfilled, with promise’s value as its first argument.
                         * 它必须在promise是成功状态后以promise的值作为第一个参数被调用
                         */
                        var x = onFulfilled(value);
                        /**
                         * 2.2.7.1
                         */
                        promiseResolveProcedure(promise2, x, resolve, reject);
                    } catch (err) {
                        /**
                         * 2.2.7.2
                         */
                        reject(err);
                    }
                }, 0);
            });
            this.onRejectedCallBacks.push(function (reason) {
               setTimeout(function () {
                   try {
                       /**
                        * 2.2.3.1
                        * it must be called after promise is rejected, with promise’s value as its first argument.
                        * 它必须在promise是失败状态后以promise的错误原因作为第一个参数被调用
                        */
                       var x = onRejected(reason);
                       /**
                        * 2.2.7.1
                        */
                       promiseResolveProcedure(promise2, x, resolve, reject);
                   } catch (err) {
                       /**
                        * 2.2.7.2
                        */
                       reject(err);
                   }
               });
            });
        }
    });
    return promise2;
};


// 这里就是链式调用的逻辑
function promiseResolveProcedure(promise, x, resolve, reject) {
    if (promise === x) {
        /**
         * 2.3.1
         * If promise and x refer to the same object, reject promise with a TypeError as the reason.
         * 如歌promise和x是相同的，抛出TypeError错误
         */
        reject(new TypeError('循环引用'));
    }

    if (x !== null && (typeof x === "object" || typeof x === "function")) {
        /**
         * 2.3.3
         * Otherwise, if x is an object or function,
         */


        /**
         * 2.3.3.1
         * Let then be x.then
         */

        var then;
        var called;

        try {
            then = x.then;
            if (typeof then === "function") {
                /**
                 * 2.3.3.3
                 * If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise
                 * 如歌then是一个方法，用call方法以 x为this，第一个参数resolvePromise 第二个参数rejectPromise 调用它
                 */
                try {
                    then.call(x, function (y) {
                        if (!called) {
                            /**
                             * 2.3.3.3.3
                             * if retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
                             * 如果resolvePromise和rejectPromise都被调用了，或者被调用了多次，则只第一次有效，后面的忽略
                             */
                            called = true;
                        }
                        /**
                         * 2.3.3.3.1
                         * If/when resolvePromise is called with a value y, run [[Resolve]](promise, y)
                         */

                        // 递归
                        promiseResolveProcedure(promise, y, resolve, reject);
                    }, function (r) {
                        if (!called) {
                            /**
                             * 2.3.3.3.3
                             */
                            called = true;
                        }
                        /**
                         * 2.3.3.3.2
                         * If/when rejectPromise is called with a reason r, reject promise with r.
                         */
                        reject(r);
                    })
                } catch (err) {
                    if (!called) {
                        /**
                         * 2.3.3.3.3
                         */
                        called = true;
                    }
                    reject(err);
                }
            } else {
                /**
                 * 2.3.3.4
                 * If then is not a function, fulfill promise with x
                 * 如果then不是一个方法，执行primise完成方法
                 */
                resolve(x);
            }
        } catch (e) {
            /**
             * 2.3.3.2
             * If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
             * 如果在取x.then的结果过程中抛出了e错误，以e为原因执行promise错误方法
             *
             * 2.3.3.3.4
             * If calling then throws an exception e,
             * 如果在调用then方法过程中抛出e错误
             */
            if (called) {
                /**
                 * 2.3.3.3.4.1
                 * If resolvePromise or rejectPromise have been called, ignore it.
                 */
                return;
            }
            /**
             * 2.3.3.3.4.2
             * Otherwise, reject promise with e as the reason.
             */
            reject(e)
        }
    } else {
        /**
         * 2.3.4
         * f x is not an object or function, fulfill promise with x.
         * 如果x既不是object也不是方法，执行primise完成方法
         */
        resolve(x);
    }
}


/**
 * @function catch
 * @param reject
 */
Promise.prototype.catch = function (reject) {
    // 调用promise的then方法获取错误原因
    this.then(null, reject);
};

/**
 * @function all
 * @param promises
 * @returns {Promise}
 */
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

/**
 * @function race
 * @param promises
 * @returns {Promise}
 */
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

/**
 * @function resolve
 * @param value
 * @returns {Promise}
 */
Promise.resolve = function (value) {
    return new Promise(function (resolve, reject) {
        resolve(value);
    })
};

/**
 * @function reject
 * @param reason
 * @returns {Promise}
 */
Promise.reject = function (reason) {
    return new Promise(function (resolve, reject) {
        reject(reason);
    })
};