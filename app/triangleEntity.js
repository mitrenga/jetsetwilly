/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
/**/
// begin code

export class TriangleEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, snap) {
    super(parentEntity, x, y, width, height);
    this.id = 'TriangleEntity';

    this.snap = snap;
    this.triangleConversion = [
      {'xBegin': 0, 'xEnd': 24, 'xStep': 1, 'yBegin': 0, 'yEnd': 24, 'yStep': 1, 'switchCoordinates': false, 'xColor': 'dark', '+Color': 'medium', '-Color': 'light'},
      {'xBegin': 0, 'xEnd': 24, 'xStep': 1, 'yBegin': 23, 'yEnd': -1, 'yStep': -1, 'switchCoordinates': true, 'xColor': 'medium', '+Color': 'light', '-Color': 'dark'},
      {'xBegin': 23, 'xEnd': -1, 'xStep': -1, 'yBegin': 0, 'yEnd': 24, 'yStep': 1, 'switchCoordinates': true, 'xColor': 'dark', '+Color': 'medium', '-Color': 'light'},
      {'xBegin': 0, 'xEnd': 24, 'xStep': 1, 'yBegin': 0, 'yEnd': 24, 'yStep': 1, 'switchCoordinates': false, 'xColor': 'medium', '+Color': 'light', '-Color': 'dark'},
      {'xBegin': 23, 'xEnd': -1, 'xStep': -1, 'yBegin': 23, 'yEnd': -1, 'yStep': -1, 'switchCoordinates': false, 'xColor': 'dark', '+Color': 'medium', '-Color': 'light'},
      {'xBegin': 23, 'xEnd': -1, 'xStep': -1, 'yBegin': 0, 'yEnd': 24, 'yStep': 1, 'switchCoordinates': true, 'xColor': 'medium', '+Color': 'light', '-Color': 'dark'},
      {'xBegin': 0, 'xEnd': 24, 'xStep': 1, 'yBegin': 23, 'yEnd': -1, 'yStep': -1, 'switchCoordinates': true, 'xColor': 'dark', '+Color': 'medium', '-Color': 'light'},
      {'xBegin': 23, 'xEnd': -1, 'xStep': -1, 'yBegin': 23, 'yEnd': -1, 'yStep': -1, 'switchCoordinates': false, 'xColor': 'medium', '+Color': 'light', '-Color': 'dark'}
    ];
    this.triangleColors = {
      'dark': 'rgb(100, 100, 100)',
      'medium': 'rgb(125, 125, 125)',
      'light': 'rgb(150, 150, 150)'
    }

    this.triangleSprite = [
      '                     -  ',
      '                   -----',
      '                 ------x',
      '               ------xxx',
      '             ------xxxxx',
      '           ------xxxxxxx',
      '         ------xxxxxxxxx',
      '       ------xxxxxx++xxx',
      '     ------xxxxxx +++xxx',
      '   ------xxxxxx   +++xxx',
      ' ------xxxxxx     +++xxx',
      '+-------xxx       +++xxx',
      '+++-------        +++xxx',
      '++++++------      +++xxx',
      '  ++++++------    +++xxx',
      '    ++++++------  +++xxx',
      '      ++++++------+++xxx',
      '        ++++++----+++xxx',
      '          ++++++--+++xxx',
      '            +++++++++xxx',
      '              +++++++xxx',
      '                +++++xxx',
      '                  +++xxx',
      '                    +x  '
    ];
  } // constructor

  drawEntity() {
    super.drawEntity();
    
    var xPoint = 0;
    var x = this.triangleConversion[this.snap]['xBegin'];
    do {
      var yPoint = 0;
      var y = this.triangleConversion[this.snap]['yBegin'];
      do {
        var color = false;
        switch (this.triangleSprite[y][x]) {
          case 'x':
            color = this.triangleColors[this.triangleConversion[this.snap]['xColor']];
            break;
          case '+':
            color = this.triangleColors[this.triangleConversion[this.snap]['+Color']];
            break;
          case '-':
            color = this.triangleColors[this.triangleConversion[this.snap]['-Color']];
            break;
            }
        if (color !== false) {
          if (this.triangleConversion[this.snap]['switchCoordinates'] == true) {
            this.app.layout.paint(this, yPoint, xPoint, 1, 1, color);
          } else {
            this.app.layout.paint(this, xPoint, yPoint, 1, 1, color);
          }
        }
        y += this.triangleConversion[this.snap]['yStep'];
        yPoint++;
      } while (y != this.triangleConversion[this.snap]['yEnd'])
      x += this.triangleConversion[this.snap]['xStep'];
      xPoint++;
    } while (x != this.triangleConversion[this.snap]['xEnd'])
  } // drawEntity

} // class TriangleEntity

export default TriangleEntity;
