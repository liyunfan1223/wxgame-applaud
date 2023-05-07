const screenWidth  = window.innerWidth
const screenHeight = window.innerHeight

let atlas = new Image()
atlas.src = 'images/Common.png'

export default class GameInfo {
  renderGameScore(ctx, score) {
    ctx.fillStyle = "#ffffff"
    ctx.font      = "20px Arial"
    console.log(score)
    ctx.fillText(
      score,
      10,
      30
    )
  }
  renderFingerPosition(ctx, position) {
    ctx.fillStyle = "#ffffff"
    ctx.font      = "20px Arial"
    ctx.fillText(
      "当前位置:" + position,
      10,
      50
    )
  }
  renderFingerOriginalPosition(ctx, position) {
    ctx.fillStyle = "#ffffff"
    ctx.font      = "20px Arial"
    ctx.fillText(
      "初始位置:" + position,
      10,
      100
    )
  }
  renderFingerDuration(ctx, duration) {
    ctx.fillStyle = "#ffffff"
    ctx.font      = "20px Arial"
    ctx.fillText(
      "持续时间(帧):" + duration,
      10,
      150
    )
  }
  renderGyroscope(ctx, gryoscope) {
    ctx.fillStyle = "#ffffff"
    ctx.font      = "20px Arial"
    ctx.fillText(
      "陀螺仪参数:" + gryoscope,
      10,
      200
    )
  }
  renderGameOver(ctx, score, personalHighScore) {
    ctx.drawImage(atlas, 0, 0, 119, 108, screenWidth / 2 - 150, screenHeight / 2 - 100, 300, 300)

    ctx.fillStyle = "#ffffff"
    ctx.font    = "20px Arial"

    ctx.fillText(
      '游戏结束',
      screenWidth / 2 - 40,
      screenHeight / 2 - 100 + 50
    )

    ctx.fillText(
      '得分: ' + score,
      screenWidth / 2 - 40,
      screenHeight / 2 - 100 + 130
    )

    if (personalHighScore) {
      ctx.fillText(
        '最高分: ' + personalHighScore,
        screenWidth / 2 - 40,
        screenHeight / 2 - 100 + 160
      )
    }
    
    ctx.drawImage(
      atlas,
      120, 6, 39, 24,
      screenWidth / 2 - 60,
      screenHeight / 2 - 100 + 180,
      120, 40
    )

    ctx.fillText(
      '重新开始',
      screenWidth / 2 - 40,
      screenHeight / 2 - 100 + 205
    )

    /**
     * 重新开始按钮区域
     * 方便简易判断按钮点击
     */
    this.btnArea = {
      startX: screenWidth / 2 - 40,
      startY: screenHeight / 2 - 100 + 180,
      endX  : screenWidth / 2  + 50,
      endY  : screenHeight / 2 - 100 + 255
    }
  }
}

