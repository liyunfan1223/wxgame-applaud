import Status from './status'
import GameInfo from '../runtime/gameinfo'
import DataBus from '../databus'
import BackGround from '../runtime/background'
import {SwitchToTest,SquareButton} from '../buttons/buttons'

const databus = new DataBus()

const screenWidth  = window.innerWidth
const screenHeight = window.innerHeight

let instance
export default class Play extends Status {
  constructor(ctx) {
    super(ctx)
    if ( instance )
      return instance
    instance = this
    this.touchStartHandler = this.touchStartEventHandler.bind(this)
    this.touchMoveHandler = this.touchMoveEventHandler.bind(this)
    this.touchEndHandler = this.touchEndEventHandler.bind(this)
    this.init(ctx)
  }
  init() {
    this.bg = new Image()
    this.bg.src = 'images/play_bg.jpg'
    this.instrument1=new SquareButton(screenWidth / 2 - 110, screenHeight / 2 - 150 ,"古琴")
    this.instrument2=new SquareButton(screenWidth / 2 +10, screenHeight / 2 - 150 ,"笛子")
    this.instrument3=new SquareButton(screenWidth / 2 -110, screenHeight / 2 - 150 +110,"古筝")
    this.instrument4=new SquareButton(screenWidth / 2 +10, screenHeight / 2 - 150 +110,"二胡")
    this.instrument5=new SquareButton(screenWidth / 2 -110, screenHeight / 2 - 150 +220,"编钟")
    this.instrument6=new SquareButton(screenWidth / 2 +10, screenHeight / 2 - 150 +220,"琵琶")
    this.switch_to_test = new SwitchToTest(screenWidth / 2 - 60, screenHeight / 2 - 100 + 280)
  }
  stop() {
    canvas.removeEventListener('touchstart', this.touchStartHandler)
    canvas.removeEventListener('touchmove',  this.touchMoveHandler)
    canvas.removeEventListener('touchend', this.touchEndHandler)
    wx.stopGyroscope()
  }
  start() {
    this.aud = new Audio('https://fanyi.sogou.com/reventondc/synthesis?text=' + '欢迎来到乐器商店！双指左滑挑选乐器。' + '&speed=1&lang=zh-CHS&from=translateweb&speaker=6')
    this.aud.play()
    canvas.addEventListener('touchstart', this.touchStartHandler)
    canvas.addEventListener('touchmove',  this.touchMoveHandler)
    canvas.addEventListener('touchend', this.touchEndHandler)
  }
  touchStartEventHandler(e) {
    e.preventDefault()
    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
    if (this.switch_to_test.ClickInsideButton(x, y)) {
      this.stop(this.ctx)
      databus.status = databus.STATUS_TEST
    }
  }
  touchMoveEventHandler(e) {
    e.preventDefault()
    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
  }
  touchEndEventHandler(e) {
    e.preventDefault()
  }
  render() {
    this.ctx.clearRect(0, 0, canvas.width, canvas.height)
    this.renderInfo()
  }
  renderInfo() {
    this.ctx.drawImage(this.bg, 0, 0, canvas.width, canvas.height)
    this.ctx.fillStyle = "#000000"
    this.ctx.font      = "20px Arial"
    this.ctx.fillText("乐器商店", 50, 60)
    this.ctx.fillStyle = "#ffffff"
    this.switch_to_test.render(this.ctx)
    this.instrument1.render(this.ctx)
    this.instrument2.render(this.ctx)
    this.instrument3.render(this.ctx)
    this.instrument4.render(this.ctx)
    this.instrument5.render(this.ctx)
    this.instrument6.render(this.ctx)
  }
  update() {
  }
}