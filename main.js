/*
In case I wake up super late...quick synopsis.
-Map art and blackhole art has been updated. Map itself has been updated.
-2 more colors added to the game functionality
-animated black hole spinning and started writing in animation for player char too, attempted doing it the "right way" first to no avail
-made background music and added file to data but didn't integrate yet.
-created and changed over instructions screen
-moved blackhole to new starting position
*/

var gamejs = require('gamejs');
var draw = require('gamejs/graphics');
var font = require('gamejs/font');
var audio = require('gamejs/audio');
var pixelcollision = require('gamejs/pixelcollision');
var tiledmap = require('gamejs/tiledmap');
var animate = require('gamejs/animate');
var $v = require('gamejs/math/vectors');
var start = Date.now();
var current = 0;
var clock;
var timer = 100;
var last_frame = Date.now();
var prev_frame = 0;
var cur_img = {};
//pull the map JSON
var map_json = {};
$.ajax({
  async: false,
  url: "data/map.json",
  success: function(data) {
      map_json = data;
  }
});
var start = Date.now();
var current = 0;
var timer = 10;
var clock;

var Map = exports.Map = function(url) {

   this.draw = function(display) {
      mapView.draw(display, [0,0]);
   };

   /**
    * constructor
    */
  var map = new tiledmap.Map(url);
  var mapView = new tiledmap.MapView(map);
  return this;
};
var SpriteSheet = exports.SpriteSheet = function(imagePath, sheetSpec) {
       this.get = function(id) {
          return surfaceCache[id];
       };

       var width = sheetSpec.width;
       var height = sheetSpec.height;
       return this;
};
var Animation = exports.Animation = function(spriteSheet, initial, spec) {
  this.get = function(id) {
    return surfaceCache[id];
  };
  this.image = spriteSheet.get;
  // FIXME cache read-only spritesheets per game
   return this;
}
//Function that determines if a wall is passable or not.
function check_wall(playerPosition, wall, wavelength, properties_ary){
  if (wall.y == 0){
    var tile_id = wall.x;
  }else{
    var tile_id = (wall.y * 30) + wall.x;
  }
  for (var k = 0; k < map_json.layers[0].data.length; k++){
    if (properties_ary.block[map_json.layers[0].data[tile_id]]){
      return true;
    }else if (properties_ary.color[map_json.layers[0].data[tile_id]]){
      if (properties_ary.color[map_json.layers[0].data[tile_id]] !== wavelength){
        return true;
      }
    }
  }
  return false;
}
function animateImage(){
  if (Date.now() - last_frame > 100){
    last_frame = Date.now();
    if (prev_frame < 5){
      prev_frame++;
    }else{
      prev_frame = 0;
    }
    return true;
  }
  return false;
}
function main() {
  var map = new Map('./data/map.tmx');
  var color;
  var GameState = 'menu';
  var walls = {};
  var wall = {};
  var total_tiles = map_json.layers[0].data.length;
  var collision_tiles = map_json.tilesets[0].tileproperties;
  var properties_ary = {'block': {}, 'color': {}};
  for(var tile = 0; tile < total_tiles; tile++){
    if (collision_tiles[tile]){
      if(collision_tiles[tile].block){
        if(collision_tiles[tile].block == 'true'){
          properties_ary.block[tile] = true;
        }
      }else if(collision_tiles[tile].color){
        properties_ary.color[tile] = collision_tiles[tile].color;
      }
   }
  }
   var player_vars = {
      'direction': '',
      'width': 50,
      'height': 50,
      'wavetype': 'red'
   }
   var blackhole_vars = {
      'speed': 2,
      'width': 150,
      'height': 150
   }
   var display = gamejs.display.getSurface();
   var blackHoles = Array('./blackhole.png', './blackhole2.png', './blackhole3.png', './blackhole4.png', './blackhole5.png', './blackhole6.png');
   var blackHole = gamejs.image.load('./blackhole0.png');
   //var player = Array('player', 'player2', 'player3', 'player4', 'player5');
   //var players = Array(player[x] + '.png', player[x] + '-2.png', player[x] + '-3.png');
   var player = gamejs.image.load('./player.png');
   var instructions = gamejs.image.load('./instructions.png');

   // create image masks from surface
   var mBlackHole = new pixelcollision.Mask(blackHole);
   var mPlayer = new pixelcollision.Mask(player);

   var newBlackHolePosition = [100, 100];
   var blackHolePosition = [300, 300];
   var playerPosition = [1, 1];

   var font = new gamejs.font.Font('20px monospace');

   var bgm = audio.Sound('./data/music.ogg');
   bgm.play(true);

   var direction = {};
   direction[gamejs.event.K_UP] = [0, -10];
   direction[gamejs.event.K_DOWN] = [0, 10];
   direction[gamejs.event.K_LEFT] = [-10, 0];
   direction[gamejs.event.K_RIGHT] = [10, 0];
   gamejs.event.onKeyUp(function(event) {
   });

   gamejs.event.onKeyDown(function(event) {
    if (GameState == 'menu') {
      if (event = gamejs.event.K_SPACE){
          GameState = 'play';
      }else { return; }
    }
    if (GameState.pause) { return; }
    if ( Timer() < 0 ) { return; }
      if (event.key  == 49 || event.key == 50 || event.key == 51 || event.key == 52 || event.key == 53) {
       switch (event.key) {
         case 49:
           player_vars.wavetype = "red";
           break;
         case 50:
           player_vars.wavetype = "blue";
           break;
         case 51:
           player_vars.wavetype = "yellow";
           break;
          case 52:
           player_vars.wavetype = "green";
          break;
          case 53:
           player_vars.wavetype = "orange";
          break;
         default:
       }
      }
      var delta = direction[event.key];
      if (delta) {
         /* playerPositioin is an array of x and y coordination  for the players position, such as Array[x,y] */
         if (playerPosition[0] > 0 && playerPosition[0] + player_vars.width < window.innerWidth - player_vars.width && playerPosition[1] > 0 && playerPosition[1] + player_vars.height < window.innerHeight - player_vars.height){
            wall.x = Math.round(playerPosition[0]/50);
            wall.y = Math.round(playerPosition[1]/50);
            var blocked = check_wall(playerPosition, wall, player_vars.wavetype, properties_ary);
            if (blocked == false){
              playerPosition = $v.add(playerPosition, delta);
            }else{
              switch (event.key) {
                case gamejs.event.K_UP:
                  playerPosition[1] = playerPosition[1] + 25;
                break;
                case gamejs.event.K_DOWN:
                  playerPosition[1] = playerPosition[1] - 25;
                break;
                case gamejs.event.K_RIGHT:
                  playerPosition[0] = playerPosition[0] - 25;
                break;
                case gamejs.event.K_LEFT:
                  playerPosition[0] = playerPosition[0] + 25;
                break;
              }
            }
         }else{
            if (playerPosition[0] < 0){
               playerPosition[0] = playerPosition[0] + 5;
            }else if (playerPosition[1] < 0){
               playerPosition[1] = playerPosition[1] + 10;
            }else if (playerPosition[0] + player_vars.width > window.innerWidth - player_vars.width){
               playerPosition[0] = playerPosition[0] - 10;
            }else if (playerPosition[1] + player_vars.height > window.innerHeight - player_vars.height){
               playerPosition[1] = playerPosition[1] - 10;
            }else{
               //playerPosition = [5,5];
            }
         }
      }
   })

   /*gamejs.event.onMouseMotion(function(event) {
      if (display.rect.collidePoint(event.pos)) {
         spearPosition = $v.subtract(event.pos, spear.getSize());
      }
   });*/

   gamejs.onTick(function() {

    if (GameState == 'menu') {
        display.blit(instructions, [window.innerWidth/2 - 375, window.innerHeight/2 -300]);
        return;
      }

      if (GameState == 'pause') { return; }

      //timer();
      if ( Timer() < 0 ) {
        return;
      }

      // draw
      if (Math.abs(newBlackHolePosition[0] - blackHolePosition[0]) < 10 && Math.abs(newBlackHolePosition[1] - blackHolePosition[1]) < 10){
         newBlackHolePosition = Array(Math.random() * ((window.innerWidth - blackhole_vars.width) - 1) + 1, Math.random() * ((window.innerHeight - blackhole_vars.height) - 1) + 1);
      }else{
         var x_displace = (blackHolePosition[0] - newBlackHolePosition[0] > 0) ? true: false;
         var y_displace = (blackHolePosition[1] - newBlackHolePosition[1] > 0) ? true: false;
         //blackHolePosition = $v.add(blackHolePosition, delta);
         if (x_displace == true){
            blackHolePosition[0] = blackHolePosition[0] - 2;
         }else{
            blackHolePosition[0] = blackHolePosition[0] + 2;
         }
         if (y_displace == true){
            blackHolePosition[1] = blackHolePosition[1] - 2;
         }else{
            blackHolePosition[1] = blackHolePosition[1] + 2;
         }
      }
      display.clear();
      map.draw(display);
      animateImage();
      //var play = gamejs.image.load(player[prev_frame]);
      display.blit(player, playerPosition);
      var bh = gamejs.image.load(blackHoles[prev_frame]);
      display.blit(bh, blackHolePosition);

      switch (player_vars.wavetype){
        case "red":
          player = gamejs.image.load('./player.png');
         break;
        case "blue":
          player = gamejs.image.load('./player2.png');
          break;
        case "yellow":
          player = gamejs.image.load('./player3.png');
        break;
        case "green":
          player = gamejs.image.load('./player4.png');
        break;
        case "orange":
          player = gamejs.image.load('./player5.png');
        break;
      }
      //draw.circle(display, color, playerPosition, 10, 0);
      // collision
      // the relative offset is automatically calculated by
      // the higher-level gamejs.sprite.collideMask(spriteA, spriteB)
      var relativeOffset = $v.subtract(playerPosition, blackHolePosition);
      //console.log(relativeOffset);
      var hasMaskOverlap = mBlackHole.overlap(mBlackHole, relativeOffset);
      if (hasMaskOverlap) {
         display.blit(font.render('COLLISION', '#ff0000'), [250, 50]);
      }

      /*var msDuration = 10;
      var spriteSheet = new SpriteSheet('./blackhole_spritesheet.png', {width: 130, height: 130});
      var animationSpec = {
      spin: {
         frames: [0,1,2,3,4,5],
         loop: true,
         rate: 3 // framerate per second
         }
      }
      var animation = new Animation(spriteSheet, 'spin', animationSpec);
      //animation.update(msDuration)
      //display.blit(animation.image, blackHolePosition);
      */
   });
  function Timer () {
    if( Math.floor( (Date.now() - start) / 1000) == current + 1 ) {
      current = Math.floor( ( Date.now() - start) / 1000);
      clock = Math.floor( timer/60 )  + " : " + ( timer % 60 < 10 ? "0" + timer % 60 : timer % 60 );
      document.getElementById( 'gameTimer' ).innerHTML = clock;
      timer --;
    }
      return timer;

  }
};

gamejs.preload([
   './blackhole0.png',
   './blackhole.png',,
   './blackhole2.png',
   './blackhole3.png',
   './blackhole4.png',
   './blackhole5.png',
   './blackhole6.png',
   './blackhole_spritesheet.png',
   './instructions.png',
   './data/map.png',
   './player.png',
   './player2.png',
   './player3.png',
   './player4.png',
   './player5.png',
   './data/music.ogg',
]);
gamejs.ready(main);
