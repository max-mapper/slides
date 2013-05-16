// before

  var worker = new Worker('my_task.js')
  readableStream.on('data', function(chunk) {
    worker.postMessage(chunk)
  })
  readableStream.on('end', function(chunk) {
    worker.postMessage(null)
  })
  worker.onmessage = function(event) {  
    console.log(event.data)
  }

// after

  var workerstream = require('workerstream')
  var worker = workerstream('my_task.js')
  worker.on('data', function(chunk) {
    console.log(chunk)
  })
  readableStream.pipe(worker)
 