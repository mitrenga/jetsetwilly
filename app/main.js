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

// animation loop
function loopGame(timestamp) {
  gameApp.loopApp(timestamp);
  requestAnimationFrame(loopGame);
} // loopGame

// master game timer & loop
function updateScene() { gameApp.model.sendEvent(0, {'id': 'updateScene'}); }
setInterval(updateScene, 67);

// events processing
window.onkeydown = function(event) { gameApp.eventKeyDown(event); }
window.onkeyup = function(event) { gameApp.eventKeyUp(event); }
window.onclick = function(event) { gameApp.eventMouseClick(event, 'left'); }
window.oncontextmenu = function(event) { gameApp.eventMouseClick(event, 'right'); }
window.ontouchstart = function(event) {gameApp.eventTouchStart(event); }
window.ontouchend =  function(event) {gameApp.eventTouchEnd(event); }
window.ontouchcancel =  function(event) {gameApp.eventTouchCancel(event); }
window.ontouchmove =  function(event) {gameApp.eventTouchMove(event); }
window.onblur = function(event) { gameApp.eventBlurWindow(event); }
window.onfocus = function(event) { gameApp.eventFocusWindow(event); }
window.onresize = function(event) { gameApp.eventResizeWindow(event); }

gameApp.resizeApp();  // calc actual model size
loopGame(0);    // start game
