var urls = {
  "blogpost": "http://voxeljs.com/", 
  "crittercreator": "http://voxelbuilder.com",
  "voxeljscom": "http://voxeljs.com/",
  "copy": "https://github.com/search?l=JavaScript&q=minecraft&ref=cmdform&type=Repositories",
  "modulearticle": "http://maxogden.com/bringing-minecraft-style-games-to-the-open-web.html",
  "blockplot": "https://github.com/maxogden/blockplot",
  "voxelcreator": "http://voxel-creator.jit.su/",
  "three": "http://threejs.org/",
  "npm": "https://npmjs.org/search?q=voxel",
  "node": "https://github.com/maxogden/art-of-node#the-art-of-node",
  "browserify": "http://browserify.org/",
  "beefy": "http://didact.us/beefy",
  "gifblocks": "http://gifblocks.com",
  "drone": "http://shama.github.io/voxel-drone/",
  "craft": "http://shama.github.io/craft/"
}

var slides = Object.keys(urls)

var game = require('voxel-hello-world')({
  texturePath: "./images/",
  playerSkin: "./images/player.png",
  materials: ["yellow"].concat(slides),
  generateVoxelChunks: false,
  chunkDistance: 1
})

var z = -5
var y = 3
slides.map(function(slide) {
  game.setBlock([0, y, z], slide)
  z += 2
  if (z > 5) {
    z = -5
    y += 2
  }
})

game.on('setBlock', function(pos, val, old) {
  var url = urls[slides[old - 2]]
  var win = window.open(url)
})

window.game = game
