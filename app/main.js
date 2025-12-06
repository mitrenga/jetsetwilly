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
window.addEventListener('keydown', (event) => gameApp.inputEventsManager.eventKeyDown(event));
window.addEventListener('keyup', (event) => gameApp.inputEventsManager.eventKeyUp(event));
window.addEventListener('click', (event) => gameApp.inputEventsManager.eventClick(event));
window.addEventListener('contextmenu', (event) => gameApp.inputEventsManager.eventContextMenu(event));
window.addEventListener('mousedown', (event) => gameApp.inputEventsManager.eventMouseDown(event));
window.addEventListener('mouseup', (event) => gameApp.inputEventsManager.eventMouseUp(event));
window.addEventListener('mousemove', (event) => gameApp.inputEventsManager.eventMouseMove(event));
window.addEventListener('touchstart', (event) => gameApp.inputEventsManager.eventTouchStart(event));
window.addEventListener('touchend', (event) => gameApp.inputEventsManager.eventTouchEnd(event));
window.addEventListener('touchcancel', (event) => gameApp.inputEventsManager.eventTouchEnd(event));
window.addEventListener('touchmove', (event) => gameApp.inputEventsManager.eventTouchMove(event));
window.addEventListener('blur', (event) => gameApp.inputEventsManager.eventBlurWindow(event));
window.addEventListener('focus', (event) => gameApp.inputEventsManager.eventFocusWindow(event));
window.addEventListener('resize', (event) => gameApp.eventResizeWindow(event));

if (navigator.getGamepads) {
  gameApp.controls.gamepads.supported = true;
}

if (window.matchMedia('(pointer: coarse)').matches) {
  gameApp.controls.touchscreen.supported = true;
}

// disable gesture on Safari mobile
document.addEventListener("gesturestart", (event) => event.preventDefault());
document.addEventListener("gestureend", (event) => event.preventDefault());
document.addEventListener("gesturechange", (event) => event.preventDefault());

// start game
gameApp.eventResizeWindow(null);
requestAnimationFrame(loopGame);
