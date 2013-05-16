// before

  reader = new FileReader()
  var offset = 0
  reader.onprogress = function(event) {
    if (reader.loaded === offset) return
    console.log(reader.target.result.slice(reader.loaded))
    this.loaded = reader.loaded
  }
  reader.readAsBinaryString(file)


// after

  var filestream = require('filestream')
  filestream( file )
    .on('data', console.log)