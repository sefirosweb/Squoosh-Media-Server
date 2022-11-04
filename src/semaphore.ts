
export default class Semaphore {
    currentRequests: Array<any>
    runningRequests: number
    maxConcurrentRequests: number

    constructor(maxConcurrentRequests = 1) {
        this.currentRequests = [];
        this.runningRequests = 0;
        this.maxConcurrentRequests = maxConcurrentRequests;
    }


    callFunction<T>(fnToCall: () => T, ...args: any): Promise<T> {
        return new Promise((resolve, reject) => {
            this.currentRequests.push({
                resolve,
                reject,
                fnToCall,
                args,
            });
            this.tryNext();
        });
    }

    tryNext() {
        if (!this.currentRequests.length) {
            return;
        } else if (this.runningRequests < this.maxConcurrentRequests) {
            let { resolve, reject, fnToCall, args } = this.currentRequests.shift();
            this.runningRequests++;
            let req = fnToCall(...args);
            req.then((res: any) => resolve(res))
                .catch((err: any) => reject(err))
                .finally(() => {
                    this.runningRequests--;
                    this.tryNext();
                });
        }
    }
}