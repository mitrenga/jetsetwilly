/**/
const { GameApp } = await import('./gameApp.js?ver='+window.srcVersion);
const { appPlatform } = await import('./appPlatform.js?ver='+window.srcVersion);
const { Tool } = await import('./svision/js/tool.js?ver='+window.srcVersion);
/*/
import GameApp from './gameApp.js';
import appPlatform from './appPlatform.js';
import Tool from './svision/js/tool.js';
/**/
// begin code

var gameApp = new GameApp(appPlatform(), window.importPath, window.wsURL, window.devModeName, window.appIconSprite);

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
window.addEventListener('wheel', (event) => gameApp.inputEventsManager.eventWheel(event));
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

// register service worker when enabled: in production (devMode === false) or in
// dev mode carrying the serviceWorker flag (devMode = {serviceWorker: true});
// plain dev mode (devMode === true) unregisters and bypasses the SW
if ('serviceWorker' in navigator) {
  const dm = window.devMode;
  // an explicit disableServiceWorker cookie (toggled from the /config page) forces the SW off
  const swDisabled = Tool.readCookie('disableServiceWorker', false) === 'true';
  const swEnabled = !swDisabled && (!dm || (typeof dm === 'object' && dm.serviceWorker));
  if (swEnabled) {
    // intentionally no auto-reload on controllerchange: on flaky old engines it
    // re-fires on every load, which caused an infinite reload loop. The updated
    // SW (skipWaiting + clients.claim) simply takes effect on the next launch.
    navigator.serviceWorker.register('serviceWorker', { type: 'module' }).catch((error) => console.error('service worker registration failed:', error));
  } else {
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((reg) => reg.unregister()));
  }
}
