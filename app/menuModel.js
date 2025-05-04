/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
const { LogoEntity } = await import('./logoEntity.js?ver='+window.srcVersion);
const { TriangleEntity } = await import('./triangleEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import ZXTextEntity from './svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
import LogoEntity from './logoEntity.js';
import TriangleEntity from './tirangleEntity.js';
/**/
// begin code

export class MenuModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'MenuModel';

    this.triangleEntity = null;
    this.triangleMoveX = Math.round(Math.random()*6);
    this.triangleMoveY = Math.round(Math.random()*6);
    this.bwColor = '#7c7c7c';
    this.redraw = false;
    this.selectedItem = 0;
    this.bkEntity = null;
    this.menuEntities = [];
    this.menuItemColor = 'rgb(108, 108, 108)';
    this.menuSelectedItemColor = 'rgb(240,240,240)';
    this.menuItems = [
      ['START GAME', ''],
      ['PLAYER NAME', 'libmit'],
      ['HALL OF FAME', ''],
      ['SOUND', 'OFF'],
      ['MUSIC', 'OFF'],
      ['CONTROLS', ''],
      ['SHOW TAPE LOADING', ''],
      ['ABOUT GAME', '']
    ];
    this.logoEntity = null;
    this.objects = [
      {'id': 'willy', 'x': 48, 'y': 160},
      {'id': 'guardian', 'x': 8, 'y': 160}
    ];
    this.copyrightEntity = null;
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('white');
    this.desktopEntity.bkColor = this.app.platform.colorByName('white');

    this.triangleEntity = new TriangleEntity(this.desktopEntity, 0, 0, 24, 24, 0);
    this.desktopEntity.addEntity(this.triangleEntity);

    this.bkEntity = new AbstractEntity(this.desktopEntity, 13, 22, 230, 140, false, 'rgba(223, 218, 208, 0.5)');
    this.desktopEntity.addEntity(this.bkEntity);

    for (var y = 0; y < this.menuItems.length; y++) {
      var bkColor = false;
      var penColor = this.menuItemColor;
      if (y == this.selectedItem) {
        bkColor = this.menuItemColor
        penColor = this.menuSelectedItemColor;
      }
      this.menuEntities[y] = [];
      this.menuEntities[y][1] = new ZXTextEntity(this.desktopEntity, 133, 30+y*16, 100, 12, this.menuItems[y][1], penColor, bkColor, 0, true);
      this.menuEntities[y][1].margin = 2;
      this.menuEntities[y][1].justify = 1;
      this.desktopEntity.addEntity(this.menuEntities[y][1]);
      this.menuEntities[y][0] = new ZXTextEntity(this.desktopEntity, 23, 30+y*16, 138, 12, this.menuItems[y][0], penColor, bkColor, 0, true);
      this.menuEntities[y][0].margin = 2;
      this.desktopEntity.addEntity(this.menuEntities[y][0]);
    }

    this.logoEntity = new LogoEntity(this.desktopEntity, 144, 6, 93, 10, 0);
    this.desktopEntity.addEntity(this.logoEntity);

    this.copyrightEntity = new ZXTextEntity(this.desktopEntity, 0, 23*8, 32*8, 8, '© 2025 GNU General Public Licence', this.app.platform.colorByName('black'), false, 0, true);
    this.copyrightEntity.justify = 2;
    this.desktopEntity.addEntity(this.copyrightEntity);

    this.floorEntity = new AbstractEntity(this.desktopEntity, 12, 176, 230, 2, false, false);
    this.desktopEntity.addEntity(this.floorEntity);

    this.sendEvent(330, {'id': 'changeFlashState'});
    this.sendEvent(150, {'id': 'changeTriangle'});
  } // init

  changeMenuItem(newItem) {
    if (newItem < 0 || newItem >= this.menuItems.length) {
      return;
    }
    this.menuEntities[this.selectedItem][0].bkColor = false;
    this.menuEntities[this.selectedItem][1].bkColor = false;
    this.menuEntities[this.selectedItem][0].penColor = this.menuItemColor;
    this.menuEntities[this.selectedItem][1].penColor = this.menuItemColor;
    this.selectedItem = newItem;
    this.menuEntities[this.selectedItem][0].bkColor = this.menuItemColor;
    this.menuEntities[this.selectedItem][1].bkColor = this.menuItemColor;
    this.menuEntities[this.selectedItem][0].penColor = this.menuSelectedItemColor;
    this.menuEntities[this.selectedItem][1].penColor = this.menuSelectedItemColor;
    this.redraw = true;
} // changeMenuItem

  handleEvent(event) {
    var result = super.handleEvent(event);
    if (result == true) {
      return true;
    }

    switch (event['id']) {
      case 'changeFlashState':
        this.flashState = !this.flashState;
        this.logoEntity.flashState = this.flashState;
        this.redraw = true;
        this.sendEvent(330, {'id': 'changeFlashState'});
        return true;
      case 'keyPress':
        switch (event['key']) {
          case 'ArrowDown':
            this.changeMenuItem(this.selectedItem+1);
            return true;
          case 'ArrowUp':
            this.changeMenuItem(this.selectedItem-1);
            return true;
          }
        break;
      case 'mouseClick':
        for (var i = 0; i < this.menuItems.length; i++) {
          if ((this.menuEntities[i][0].parentX+this.menuEntities[i][0].x)*this.app.layout.ratio <= event['x'] &&
            (this.menuEntities[i][0].parentY+this.menuEntities[i][0].y)*this.app.layout.ratio <= event['y'] &&
            (this.menuEntities[i][1].parentX+this.menuEntities[i][1].x+this.menuEntities[i][1].width)*this.app.layout.ratio >= event['x'] &&
            (this.menuEntities[i][1].parentY+this.menuEntities[i][1].y+this.menuEntities[i][1].height)*this.app.layout.ratio >= event['y']
          ) {
            this.changeMenuItem(i);
            return true;
          }
        }        
        break;
      case 'changeTriangle':
        this.triangleEntity.snap++;
        if (this.triangleEntity.snap > 7) {
          this.triangleEntity.snap = 0;
        }
        this.triangleEntity.x += this.triangleMoveX;
        this.triangleEntity.y += this.triangleMoveY;
        if (this.triangleEntity.x < 0) {
          this.triangleEntity.x -= this.triangleMoveX;
          this.triangleMoveX = Math.round(Math.random()*6);
          this.triangleEntity.x += this.triangleMoveX;

        }
        if (this.triangleEntity.x > 231) {
          this.triangleEntity.x -= this.triangleMoveX;
          this.triangleMoveX = -Math.round(Math.random()*6);
          this.triangleEntity.x += this.triangleMoveX;

        }
        if (this.triangleEntity.y < 0) {
          this.triangleEntity.y -= this.triangleMoveY;
          this.triangleMoveY = Math.round(Math.random()*6);
          this.triangleEntity.y += this.triangleMoveY;

        }
        if (this.triangleEntity.y > 159) {
          this.triangleEntity.y -= this.triangleMoveY;
          this.triangleMoveY = -Math.round(Math.random()*6);
          this.triangleEntity.y += this.triangleMoveY;

        }
        this.redraw = true;
        this.sendEvent(150, {'id': 'changeTriangle'});
        return true;
      case 'setMenuData':
        var willy = Object.assign(
          event['data']['willy'],
          {
            'sprite': this.app.globalData['willy']['sprite'],
            'paintCorrections': this.app.globalData['willy']['paintCorrections'],
            'width': this.app.globalData['willy']['width'],
            'height': this.app.globalData['willy']['height']
          }
        );
        this.setData(Object.assign(event['data'], {'willy': willy}));
        return true;
    }
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    if (this.redraw == true) {
      this.redraw = false;
      this.drawModel();
    }
  }

} // class MenuModel

export default MenuModel;
