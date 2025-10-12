/**/
const { GameApp } = await import('./gameApp.js?ver='+window.srcVersion);
const { appPlatform } = await import('./appPlatform.js?ver='+window.srcVersion);
/*/
import GameApp from './gameApp.js';
import appPlatform from './appPlatform.js';
/**/
// begin code

var gameApp = new GameApp(appPlatform(), window.importPath, window.wsURL);

// animation loop
function loopGame(timestamp) {
  gameApp.loopApp(timestamp);
  requestAnimationFrame(loopGame);
} // loopGame

// events processing
window.onkeydown = function(event) { gameApp.inputEventsManager.eventKeyDown(event); }
window.onkeyup = function(event) { gameApp.inputEventsManager.eventKeyUp(event); }
window.onclick = function(event) { gameApp.inputEventsManager.eventClick(event); }
window.oncontextmenu = function(event) { gameApp.inputEventsManager.eventContextMenu(event); }
window.onmousedown = function(event) { gameApp.inputEventsManager.eventMouseDown(event); }
window.onmouseup = function(event) { gameApp.inputEventsManager.eventMouseUp(event); }
window.onmousemove = function(event) { gameApp.inputEventsManager.eventMouseMove(event); }
window.ontouchstart = function(event) {gameApp.inputEventsManager.eventTouchStart(event); }
window.ontouchend = function(event) {gameApp.inputEventsManager.eventTouchEnd(event); }
window.ontouchcancel = function(event) {gameApp.inputEventsManager.eventTouchCancel(event); }
window.ontouchmove = function(event) {gameApp.inputEventsManager.eventTouchMove(event); }
window.ongamepadconnected = function(event) { gameApp.inputEventsManager.eventGamePadConnected(event); }
window.ongamepaddisconnected = function(event) { gameApp.inputEventsManager.eventGamePadDisconnected(event); }
window.onblur = function(event) { gameApp.inputEventsManager.eventBlurWindow(event); }
window.onfocus = function(event) { gameApp.inputEventsManager.eventFocusWindow(event); }
window.onresize = function(event) { gameApp.eventResizeWindow(event); }

// start game
gameApp.eventResizeWindow(null);
requestAnimationFrame(loopGame);
