import Status from './status'
import GameInfo from '../runtime/gameinfo'
import DataBus from '../databus'
import BackGround from '../runtime/background'
import {SwitchToTest} from '../buttons/buttons'

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
    this.switch_to_test = new SwitchToTest(screenWidth / 2 - 60, screenHeight / 2 - 100 + 180)
  }
  stop() {
    canvas.removeEventListener('touchstart', this.touchStartHandler)
    canvas.removeEventListener('touchmove',  this.touchMoveHandler)
    canvas.removeEventListener('touchend', this.touchEndHandler)
    wx.stopGyroscope()
  }
  start() {
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
    this.ctx.fillStyle = "#ffffff"
    this.ctx.font      = "20px Arial"
    this.ctx.fillText("开始界面", 10, 50)
    this.switch_to_test.render(this.ctx)
  }
  update() {
  }
}