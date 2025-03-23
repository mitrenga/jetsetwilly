/**/
const { GameApp } = await import('./gameApp.js?ver='+window.srcVersion);
const { appPlatform } = await import('./appPlatform.js?ver='+window.srcVersion);
/*/
import GameApp from './gameApp.js';
import appPlatform from './appPlatform.js';
/**/
// begin code

var gameApp = new GameApp(appPlatform, window.wsURL);
var audio = null;

function resizeGame() {
  var elementRoot = document.documentElement;
  if (window.innerHeight != gameApp.element.height) {
    elementRoot.style.setProperty('--app-height', window.innerHeight+'px');
  }
  gameApp.resizeApp();
} // resizeGame

// main loop
function loopGame(timestamp) {
  gameApp.loopApp(timestamp);
  requestAnimationFrame(loopGame);
} // loopGame

// keyboard press key
window.onkeydown = function(e) { console.log('press '+e.key); }
// keyboard release key
window.onkeyup = function(e) { console.log('release '+e.key); }
// mouse left key
gameApp.element.onclick = function(e) { gameApp.onClick(e); e.preventDefault(); }
// mouse right key
window.oncontextmenu = function(e) { gameApp.onClick(e); e.preventDefault(); }
// touch screen
gameApp.element.ontouchstart = function(e) { gameApp.onClick(e); e.preventDefault(); }
gameApp.element.ontouchmove = function(e) { console.log(e.touches.length+' '+e.touches[0].clientX+' '+e.touches[0].clientY); e.preventDefault(); }
gameApp.element.ontouchend = function(e) { e.preventDefault(); }
gameApp.element.ontouchcancel = function(e) { e.preventDefault(); }
// resize event
window.onresize = function(e) { resizeGame(); }
// blur window
window.onblur = function(e) { console.log('blur window'); }
//focus window
window.onfocus = function(e) { console.log('focus window'); }

resizeGame();  // calc actual model size
loopGame(0);    // start game
