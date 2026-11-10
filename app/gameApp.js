const { Version } = await import('./version.js?ver='+window.srcVersion);
const { AbstractApp } = await import('./svision/js/abstractApp.js?ver='+window.srcVersion);
const { AudioManager } = await import('./audioManager.js?ver='+window.srcVersion);
const { ZXFonts8x8 } = await import('./svision/js/platform/canvas2D/zx/zxFonts8x8.js?ver='+window.srcVersion);
const { Fonts5x5 } = await import('./svision/js/platform/canvas2D/fonts5x5.js?ver='+window.srcVersion);
const { Fonts3x3 } = await import('./svision/js/platform/canvas2D/fonts3x3.js?ver='+window.srcVersion);
const { ZXResetModel } = await import('./svision/js/platform/canvas2D/zx/zxResetModel.js?ver='+window.srcVersion);
const { MenuModel } = await import('./menuModel.js?ver='+window.srcVersion);
const { MainModel } = await import('./mainModel.js?ver='+window.srcVersion);
const { RoomsMapModel } = await import('./roomsMapModel.js?ver='+window.srcVersion);
const { RoomModel } = await import('./roomModel.js?ver='+window.srcVersion);
const { GameOverModel } = await import('./gameOverModel.js?ver='+window.srcVersion);
const { TapeLoadingModel } = await import('./tapeLoadingModel.js?ver='+window.srcVersion);
const { ZXErrorEntity } = await import('./svision/js/platform/canvas2D/zx/zxErrorEntity.js?ver='+window.srcVersion);
const { Tool } = await import('./svision/js/tool.js?ver='+window.srcVersion);
const { ZXColor } = await import('./svision/js/platform/canvas2D/zx/zxColor.js?ver='+window.srcVersion);
// begin code

export class GameApp extends AbstractApp {
  
  constructor(platform, importPath, wsURL, devModeName, appIconSprite) {
    super(platform, 'bodyApp',  importPath, wsURL);

    this.worker = new Worker(this.importPath+'/gameWorker.js?ver='+window.srcVersion);
    this.worker.onmessage = (event) => {
      if (this.model) {
        this.model.handleWorkerMessage(event);
      }
    };

    this.version = Version;
    this.copyright = 'Remake by L. Mitrenga, CC␣BY⋅NC⋅SA';
    this.devModeName = devModeName;
    this.appIconSprite = appIconSprite;
    
    this.audioManager = new AudioManager(this);
    this.muted = {sounds: false, music: false};

    this.fonts = {
      zxFonts8x8Mono: new ZXFonts8x8(this, false),
      zxFonts8x8: new ZXFonts8x8(this, true),
      fonts5x5: new Fonts5x5(this),
      fonts3x3: new Fonts3x3(this)
    };
    // Hard/short spaces live in the game (svision core fonts have the normal space only).
    this.fonts.fonts5x5.addSpace('␣', {width: 2, breaking: false, stretch: true});

    this.fonts.zxFonts8x8.addSpace('␣', {width: 4, breaking: false, stretch: false});


    this.controlsOptions = {
      keyboard: {
        device: 'keyboard',
        keys: [
          {action: 'left', label: 'WALKING LEFT'},
          {action: 'right', label: 'WALKING RIGHT'},
          {action: 'jump', label: 'JUMP'},
          {action: 'music', label: 'MUTE MUSIC'},
          {action: 'sounds', label: 'MUTE SOUNDS'}
        ]
      },
      mouse: {
        device: 'mouse',
        keys: [
          {action: 'left', label: 'WALKING LEFT'},
          {action: 'right', label: 'WALKING RIGHT'},
          {action: 'jump', label: 'JUMP'}
        ]
      },
      gamepads: {
        device: 'gamepads',
        keys: [
          {action: 'left', label: 'WALKING LEFT', eventKey: 'GamepadLeft'},
          {action: 'right', label: 'WALKING RIGHT', eventKey: 'GamepadRight'},
          {action: 'jump', label: 'JUMP', eventKey: 'GamepadJump'},
          {action: 'up', label: 'MENU UP', eventKey: 'GamepadUp'},
          {action: 'down', label: 'MENU DOWN', eventKey: 'GamepadDown'},
          {action: 'ok', label: 'OK', eventKey: 'GamepadOK'},
          {action: 'exit', label: 'EXIT', eventKey: 'GamepadExit'}
        ]
      },
      // Jedna polovina obrazovky je páka (chůze vlevo a vpravo), druhá skok;
      // která je která, je volba pro leváky a praváky v SETTINGS. Tvar je
      // tentýž jako u sourozenců (booty, sabrewulf, jetpac …): `types` říká,
      // která polovina je na které straně (`sprite` je ikona v SETTINGS),
      // `halves` co polovina dělá a `zones` její dotykové plochy – `rect` je
      // zlomek poloviny ([x, y, šířka, výška]), takže rozložení nezávisí na
      // velikosti displeje.
      touchscreen: {
        device: 'touchscreen',
        types: {
          // první klíč je i náhrada za poškozenou cookie
          keys: [
            'leftJump',
            'rightJump'
          ],
          leftJump: {
            left: {half: 'jump', sprite: 'jump'},
            right: {half: 'walk', sprite: 'left-right'}
          },
          rightJump: {
            left: {half: 'walk', sprite: 'left-right'},
            right: {half: 'jump', sprite: 'jump'}
          }
        },
        halves: {
          // páka jen ve vodorovné ose: Willy chodí, nahoru a dolů nic není
          walk: {
            icon: 'left-right',
            zones: [
              {rect: [0, 0, 1, 1], type: 'joystick', control: 'horizontal',
               actions: {left: 'left', right: 'right'}}
            ]
          },
          jump: {
            icon: 'jump',
            zones: [
              {rect: [0, 0, 1, 1], type: 'button', action: 'jump'}
            ]
          }
        },
        // o kolik pixelů od posledního středu musí prst ujet, než páka změní
        // směr (páka je relativní, viz touchMove)
        joystickStep: 10,
        icons: {
          jump: {
            compressedSpriteData: 'lP101300N0A970111030Z0510122382012345617171859'
          },
          'left-right': {
            compressedSpriteData: 'lP101300N08B701050P020N06910121213421245641465421243121217'
          }
        }
      }
    }

    this.controls = {
      keyboard: this.getControls('keyboard'),
      mouse: this.getControls('mouse'),
      touchscreen: this.getControls('touchscreen'),
      gamepads: this.getControls('gamepads')
    };

    this.roomNumber = false;
    this.roomName = '';
    this.restartInGameMelody = true;
    this.timeCounter = 0;
    this.timeStr = '';
    this.demo = false;
    this.demoRooms = [];
    this.lives = 7;
    this.extraGame = false;
    this.gameState = 1;
    this.playerName = Tool.readCookie('playerName', '');
    this.items = [];
    this.totalItems = 0;
    this.itemsCollected = {};
    this.gameCompleted = 0;
    this.willyRoomsCache = {willy: false};
    this.willySafeInitPositionCache = {willy: false};
    this.globalData = false;
    this.roomsMapPositions = {};
    this.id = 'GameApp';
    this.fetchDataId = '';
    this.setModel('LoadingModel');
    this.loadAppData();
  } // constructor

  getControls(device) {
    var result = {};

    switch(device) {
      case 'keyboard': 
        result = {left: 'ArrowLeft', right: 'ArrowRight', jump: ' ', music: 'M', sounds: 'S'};
        break;
      case 'mouse': 
        result = {enable: false, left: 'Mouse1', right: 'Mouse2', jump: 'Mouse4'};
        break;
      case 'touchscreen':
        result = {supported: false, type: 'leftJump'};
        break;
      case 'gamepads': 
        result = {supported: false, devices: {}};
        break;
    }

    switch (device) {
      case 'keyboard':
      case 'mouse':
      case 'touchscreen':
        var cfgString = Tool.readCookie(device, false);
        if (cfgString !== false) {
          try {
            var cfg = JSON.parse(cfgString);
            Object.keys(cfg).forEach((item) => {
              result[item] = cfg[item];
              if (device == 'touchscreen' && !(result[item] in this.controlsOptions.touchscreen.types)) {
                result[item] = this.controlsOptions.touchscreen.types.keys[0];
              }
            });
          } catch (error) {
            console.error(error.message);
          }
        }
        break;
      case 'gamepads':
        var devicesString = Tool.readCookie('gamepads', false);
        if (devicesString !== false) {
          try {
            var devices = JSON.parse(devicesString);
          } catch (error) {
            console.error(error.message);
          } finally {
            if (Array.isArray(devices)) {
              devices.forEach((id) => {
                var deviceString = Tool.readCookie(id, false);
                if (deviceString !== false) {
                  try {
                    var device = JSON.parse(deviceString);
                  } catch (error) {
                    console.error(error.message);
                  } finally {
                    result.devices[id] = device;
                  }
                }
              });
            }
          }
        }
        break;
    }
    return result;
  } // getControls

  setModel(model) {
    if (model == 'MenuModel' && this.globalData === false) {
      // the fetch may still be pending or has failed: as a last resort try the
      // data cached in localStorage before bothering the user
      if (!this.loadGlobalDataFromStorage()) {
        this.showErrorMessage('Game data could not be loaded.', 'retry');
        return;
      }
    }
    var needResizeApp = false;
    var selectionItem = 0;
    if (this.model) {
      if (this.model.id == 'TapeLoadingModel') {
        selectionItem = 6;
      }
      this.model.shutdown();
      needResizeApp = true;
    }
    switch (model) {
      case 'LoadingModel':
        this.model = new ZXResetModel(this);
        break;
      case 'MenuModel':
        this.model = new MenuModel(this, selectionItem);
        break;
      case 'MainModel':
        this.model = new MainModel(this);
        break;
      case 'RoomsMapModel':
        this.model = new RoomsMapModel(this);
        break;
      case 'RoomModel':
        this.model = new RoomModel(this, this.roomNumber, this.demo);
        break;
      case 'GameExitModel':
        this.model = new GameOverModel(this, false, 'MenuModel');
        break;
      case 'GameOverModel':
        this.model = new GameOverModel(this, true, 'MainModel');
        break;
      case 'TapeLoadingModel':
        this.model = new TapeLoadingModel(this);
        break;
    } // switch
    this.model.init();
    if (needResizeApp) {
      this.resizeApp();
    }
  } // setModel
  
  startRoom(demo, newGame, crash, setInitRoom, extraGame, roomNumber) {
    if (newGame) {
      this.gameState = 0;
      this.itemsCollected = {};
      this.gameCompleted = 0;
      this.timeCounter = 0;
      this.timeStr = ' 7:00am';
      this.lives = 7;
      this.restartInGameMelody = true;
      if (setInitRoom) {
        this.willyRoomsCache = {
          init: true,
          width: this.globalData.willy.width,
          height: this.globalData.willy.height,
          paintCorrections: this.globalData.willy.paintCorrections,
          frames: this.globalData.willy.frames,
          directions: this.globalData.willy.directions,
          roomNumber: roomNumber,
          previousDirection: 0,
          jumpCounter: 0,
          jumpDirection: 0,
          fallingCounter: 0,
          fallingDirection: 0
        };
        this.roomNumber = roomNumber;
      }
    } else {
      if (crash && this.willySafeInitPositionCache.willy !== false) {
        this.willyRoomsCache = {...this.willySafeInitPositionCache};
        this.roomNumber = this.willySafeInitPositionCache.roomNumber;
      }
    }
    this.demo = demo;
    this.extraGame = extraGame;
    this.setModel('RoomModel');
  } // startRoom
  
  applyGlobalData(global) {
    this.globalData = global;

    var roomsMap = this.globalData.roomsMap.positions;
    for (var y = 0; y < roomsMap.length; y++) {
      for (var x = 0; x < roomsMap[y].length; x++) {
        if (roomsMap[y][x] !== false) {
          this.roomsMapPositions[roomsMap[y][x]] = {x: x, y: y};
        }
      }
    }

    this.items = [];
    var id = 0;
    for (var r = 0; r < this.globalData.roomsCount; r++) {
      this.items.push([]);
    }
    var dataItems = this.globalData.items;
    dataItems.forEach((item) => {
      var binaryItem = Tool.hexToBin(item);
      // The location of an item is defined by a pair of bytes. The meaning of the bits in each byte pair is as follows:
      // 15 Most significant bit of the y-coordinate
      // 14 Collection flag (reset=collected, set=uncollected)
      // 8-13 Room number
      // 5-7 Least significant bits of the y-coordinate
      // 0-4 x-coordinate
      var x = Tool.binToInt(binaryItem.substring(11, 16));
      var y = Tool.binToInt(binaryItem.substring(0, 1)+binaryItem.substring(8, 11));
      var room = Tool.binToInt(binaryItem.substring(2, 8));
      this.items[room].push({x: x, y: y, id: id});
      id++;
    });
    this.totalItems = id;
  } // applyGlobalData

  setGlobalData(data) {
    this.applyGlobalData(data.data.global);

    var files = {};
    Object.keys(data.data).forEach((key) => {
      if (key != 'global') {
        files[key] = data.data[key];
      }
    });
    // global goes last; a full localStorage is cleared and tried once more
    // (R-062)
    this.saveAppDataToStorage(files, data.data.global);
  } // setGlobalData

  // Load the application data: from the server when online (which also refreshes
  // localStorage), or rehydrate the global data from localStorage when offline.
  // The timeout covers an unreachable server with the device still online:
  // without it the request may hang far longer than the boot sequence.
  loadAppData() {
    if (navigator.onLine) {
      this.fetchDataId = this.fetchData('appData.db', false, {}, this, 2000);
    } else {
      this.loadGlobalDataFromStorage();
    }
  } // loadAppData

  loadGlobalDataFromStorage() {
    var stored = localStorage.getItem(window.appPrefix+'.global');
    if (stored !== null) {
      try {
        this.applyGlobalData(JSON.parse(stored));
        return true;
      } catch (error) {
        console.error(error.message);
      }
    }
    return false;
  } // loadGlobalDataFromStorage

  setData(data) {
    this.setGlobalData(data);
  } // setData

  errorData(error) {
    // The network request failed (offline, unreachable server, or the fetch
    // timeout). Fall back to the data cached in localStorage; if none exists,
    // log it and let the MenuModel guard surface the error to the user.
    if (!this.loadGlobalDataFromStorage()) {
      console.error(error.message ? error.message : error);
      return;
    }
    // Resume a boot that already gave up waiting for this response (the user
    // pressed IGNORE on the error panel and the app is stuck on the reset
    // screen). Skip when the menu handover is still scheduled or the error
    // panel is open — those paths reach the menu on their own.
    if (this.model && this.model.id == 'ZXResetModel'
        && !this.model.events.some((queued) => queued.id == 'setMenuModel')
        && !this.model.desktopEntity.modalEntity) {
      this.setModel('MenuModel');
    }
  } // errorData

  showErrorMessage(message, action) {
    var topModalEntity = this.model.desktopEntity.topModalEntity();
    topModalEntity.addModalEntity(
      new ZXErrorEntity(
        topModalEntity,
        -topModalEntity.absoluteX(),
        -topModalEntity.absoluteY(),
        this.fonts.zxFonts8x8,
        message,
        action,
        ZXColor.white,
        ZXColor.red
      )
    );
  } // showErrorMessage
  
} // GameApp
