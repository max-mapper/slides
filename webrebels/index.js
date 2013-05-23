var urls = {
  "blogpost": "http://maxogden.com/bringing-minecraft-style-games-to-the-open-web.html",
  "meshing": "http://0fps.wordpress.com/2012/07/07/meshing-minecraft-part-2/",
  "semver": "http://semver-ftw.org/",
  "engine-api": "https://github.com/maxogden/voxel-engine#requirevoxel-engineoptions",
  "install": "https://github.com/maxogden/voxel-hello-world#get-it-running-on-your-machine",
  "crittercreator": "http://voxelbuilder.com",
  "voxeljscom": "http://voxeljs.com/",
  "copy": "https://github.com/search?l=JavaScript&q=minecraft&ref=cmdform&type=Repositories",
  "modulearticle": "https://gist.github.com/maxogden/5147486",
  "blockplot": "https://github.com/maxogden/blockplot",
  "voxelcreator": "http://voxel-creator.jit.su/",
  "three": "http://threejs.org/",
  "npm": "https://npmjs.org/search?q=voxel",
  "node": "https://github.com/maxogden/art-of-node#the-art-of-node",
  "browserify": "http://browserify.org/",
  "beefy": "http://didact.us/beefy",
  "gifblocks": "http://gifblocks.com",
  "drone": "http://shama.github.io/voxel-drone/",
  "craft": "http://shama.github.io/craft/",
  "skin": "http://maxogden.github.io/minecraft-skin/",
  "loopjs": "http://www.youtube.com/watch?v=827L7UA_0bc",
  "archiveroom": "http://archiveroom.net/",
  "nyc": "https://twitter.com/voxeljs/status/324253185868963840",
  "mineflayer": "https://github.com/vogonistic/mineflayer-voxel#mineflayer-voxel",
  "floodfill": "http://www.ludumdare.com/compo/ludum-dare-26/?action=preview&uid=22924"
}

var slides = Object.keys(urls)
var skin = require('minecraft-skin')

var game = require('voxel-hello-world')({
  texturePath: "./images/",
  playerSkin: "./images/player.png",
  materials: ["yellow"].concat(slides),
  chunkDistance: 1,
})

var makeFly = require('voxel-fly')(game)
makeFly(game.controls.target())

window.avatar = game.controls.target().avatar

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

var viking = skin(game.THREE, 'viking.png')
window.viking = viking
viking.mesh.position.set(2, 2, 2)
viking.mesh.rotation.y = Math.PI
viking.mesh.scale.set(0.04, 0.04, 0.04)
game.scene.add(viking.mesh)

game.on('setBlock', function(pos, val, old) {
  if (old === 1 || val === 1) return
  var url = urls[slides[old - 2]]
  var win = window.open(url)
})

game.interact.on('release', function() { game.paused = true })
game.interact.on('attain', function() { game.paused = false })

window.game = game