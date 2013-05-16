// before

  navigator.getUserMedia({video: true},
    function(stream) {
      ...
      // attach object URL to <video>
      videoElement.src = window.webkitURL.createObjectURL(stream)
      ...
      // draw video frame to <canvas>
      canvasElement.getContext('2d').drawImage(objectURL, 0, 0)
      ...
      writableStream.write(canvasElement.toDataURL('image/webp'))
      ...
    }
  )

// after
  
  var mediastream = require('mediastream')
  var media = mediastream({video: true})
  media.pipe(writableStream)

