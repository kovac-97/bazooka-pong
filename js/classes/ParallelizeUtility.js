class ParallelizeUtility {

    /*
        Since JavaScript requires WebWorkers to load a file, we need to create a BLOB URL.
        WebWorkers have isolated memory space and cannot acces anything outside of their scope.
        We might want to paralelize tasks that include complex object hierarchies.
        That's what functions reassembleObjectString and PrepareObjectForCloning do.
        Using simple structuredClone(obj) or JSON.parse(JSON.stringify(obj)) will not copy functions declared using traditional object-oriented approach.
      
        Preparing object is done by adding a property 'cloningScript' to it. This script can initialize the class when called in a separate memory space.
        This is done recursively untill all classes and superclasses are prepared for cloning.

        Reassembling the object is done by creating a function using a cloning script, then setting the prototype of the object to that class prototype.
        This is done recursively untill all subclasses and classes are created.
    */

    constructor(data, parallelCallback, returnCallback, threads = navigator.hardwareConcurrency) {
        this.threads = threads; //Number of threads to be used. Default is maximum available. Doesn't work on Safari.
        this.promises = new Array(threads); // Objects needed to allow calling function to await the parallel tasks.
        this.returnCallback = returnCallback;
        //Function that runs in parallel created as a URL blob.  

        let reassembleObjectString = function reassembleObject(object) {
            if (typeof object != 'object') { return; }
            if ('cloningScript' in object) {
                // if there is a cloning script, assign prototype
                var objectClass = (new Function(`return ${object['cloningScript']}`))();
                Object.setPrototypeOf(object, objectClass.prototype)
            }
            for (var key of Object.keys(object)) {
                reassembleObject(object[key]);
            }
        };

        this.blobFunction = URL.createObjectURL(new Blob([reassembleObjectString, '(',
            function (callback) {
                self.addEventListener('message', function (e) {
                    //Web Workers cannot access the memory of the calling thread.
                    //All data must be transfered to the Worker.
                    //We will use two types of messages:

                    //  {type: 'staticData',  data: {...}} -> for data that will be evenly distributed across threads
                    //  {type: 'dynamicData', data: {...}} -> for data that will be sent for every task run

                    switch (e.data.type) {
                        case 'dynamicData':
                            if (self.data != undefined) {
                                //Send data back to calling thread using self.PostMessage(data);
                                var results = [];
                                for (var obj of self.data)
                                    results.push(callback(
                                        obj,
                                        JSON.parse(e.data.data)
                                    ));
                                self.postMessage(results);

                            } else {
                                console.log("Must first load data :(");
                            }
                            break;
                        case 'staticData':
                            self.data = JSON.parse(e.data.data);
                            reassembleObject(self.data);
                            break;
                    }
                });
            }.toString(),
            ')(', parallelCallback.toString(), ')'], { type: 'application/javascript' }));


        //To avoid CSP errors, workers must already be created in the same scope as the blob.
        //now we can run arbitrary code using the postMessage(data);


        /*
            dataThreadMatrix is a matrix of dimensions [NUM_THREADS * DATA_TO_THREAD_RATIO]
            
            In case of two threads and objects {obj1, ..., obj5}, the matrix would look like (rotated to the side):
            -------------------
            | obj1  obj3 obj5 | <-- Handled by Thread 1
            | obj2  obj4      | <-- Handled by Thread 2
            -------------------
            We use this matrix to evenly distribute data across threads.
        */
        var dataThreadMatrix = new Array(threads);
        this.workers = [];
        for (var i = 0; i < threads; i++) {

            this.workers[i] = new Worker(this.blobFunction);
            dataThreadMatrix[i] = new Array();
        }

        for (var i = 0; i < data.length; i++) {
            dataThreadMatrix[i % threads].push(data[i]);
        }

        this.loadData(dataThreadMatrix);
    }



    async loadData(dataThreadMatrix) {

        //Messages cannot contain objects, so we send a JSON for it to be parsed later.


        for (var workerIndex in this.workers) {
            this.promises[workerIndex] = new Promise((resolve) => {
                this.workers[workerIndex].addEventListener('message', (msgData) => { resolve(msgData); });
            });
            this.workers[workerIndex].postMessage({ type: 'staticData', data: JSON.stringify(dataThreadMatrix[workerIndex]) });
        }

        await Promise.all(this.promises);


    }


    runTasks(dynamicData) {

        for (var workerIndex in this.workers) {
            this.promises[workerIndex] = new Promise((resolve) => {
                //Using onmessage because we would have to remove the listener otherwise
                this.workers[workerIndex].onmessage = (msgData) => { resolve(msgData); };
            });
            this.workers[workerIndex].postMessage({ type: 'dynamicData', data: JSON.stringify(dynamicData) });
        }

        return Promise.all(this.promises).then((results) => {
            for (var workerResults of results) {
                for (var result of workerResults.data) {
                    this.returnCallback(result);
                }
            }
        });

    }



    static prepareObjectForCloning(object) {
        for (var key of Object.keys(object)) {
            if (typeof object[key] == 'object')
                ParallelizeUtility.prepareObjectForCloning(object[key]);
        }
        if (typeof object == 'object') { 
            //we do not want to assign properties to primitives
            //do not try cloning native objects:
            var script = object.constructor.toString();
            if (!script.includes('[native code]'))
                object['cloningScript'] = script;
        }
    }

}
