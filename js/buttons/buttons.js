let atlas = new Image()
atlas.src = 'images/Common.png'

class Button {
  constructor(dx, dy) {
    // 左上角位置坐标
    this.dx = dx
    this.dy = dy
  }
  ClickInsideButton(x, y) {
    if (x >= this.dx && x <= this.dx + this.dw &&
        y >= this.dy && y <= this.dy + this.dh) {
      return true;
    }
    return false;
  }
};

export class SwitchToPlay extends Button {
  constructor(dx, dy) {
    super(dx, dy)
    // 裁剪位置和长宽
    this.sx = 120;
    this.sy = 6;
    this.sw = 39;
    this.sh = 24;
    // 显示大小
    this.dw = 120;
    this.dh = 40;
  }
  render(ctx) {
    ctx.drawImage(
      atlas,
      this.sx, this.sy, this.sw, this.sh,
      this.dx, this.dy,
      this.dw, this.dh
    )
    ctx.fillText(
      '游戏界面',
      this.dx + 20,
      this.dy + 25,
    )
  }
}

export class SwitchToTest extends Button {
  constructor(dx, dy) {
    super(dx, dy)
    this.sx = 120;
    this.sy = 6;
    this.sw = 39;
    this.sh = 24;
    this.dw = 120;
    this.dh = 40;
  }
  render(ctx) {
    ctx.drawImage(
      atlas,
      this.sx, this.sy, this.sw, this.sh,
      this.dx, this.dy,
      this.dw, this.dh
    )
    ctx.fillText(
      '返回测试',
      this.dx + 20,
      this.dy + 25,
    )
  }
}

export class SwitchToIndex extends Button {
  constructor(dx, dy) {
    super(dx, dy)
    // 裁剪位置和长宽
    this.sx = 120;
    this.sy = 6;
    this.sw = 39;
    this.sh = 24;
    // 显示大小
    this.dw = 120;
    this.dh = 40;
  }
  render(ctx) {
    ctx.drawImage(
      atlas,
      this.sx, this.sy, this.sw, this.sh,
      this.dx, this.dy,
      this.dw, this.dh
    )
    ctx.fillText(
      '开始界面',
      this.dx + 20,
      this.dy + 25,
    )
  }
}

export class SwitchToStore extends Button {
  constructor(dx, dy) {
    super(dx, dy)
    // 裁剪位置和长宽
    this.sx = 120;
    this.sy = 6;
    this.sw = 39;
    this.sh = 24;
    // 显示大小
    this.dw = 120;
    this.dh = 40;
  }
  render(ctx) {
    ctx.drawImage(
      atlas,
      this.sx, this.sy, this.sw, this.sh,
      this.dx, this.dy,
      this.dw, this.dh
    )
    ctx.fillText(
      '商店界面',
      this.dx + 20,
      this.dy + 25,
    )
  }
}

export class SwitchToStory extends Button {
  constructor(dx, dy) {
    super(dx, dy)
    // 裁剪位置和长宽
    this.sx = 120;
    this.sy = 6;
    this.sw = 39;
    this.sh = 24;
    // 显示大小
    this.dw = 120;
    this.dh = 40;
  }
  render(ctx) {
    ctx.drawImage(
      atlas,
      this.sx, this.sy, this.sw, this.sh,
      this.dx, this.dy,
      this.dw, this.dh
    )
    ctx.fillText(
      '剧情界面',
      this.dx + 20,
      this.dy + 25,
    )
  }
}