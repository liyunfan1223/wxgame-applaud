import Status from './status'
import GameInfo from '../runtime/gameinfo'
import DataBus from '../databus'
import BackGround from '../runtime/background'
import {SwitchToTest} from '../buttons/buttons'

const databus = new DataBus()

const THRESHOLD_SLIDE = 50
const THRESHOLD_SKEW = 2.0
const LEAST_OP_INTERVAL_FRAME = 60
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
    this.bgm = new Audio('audio/chysx_mod_short.mp3')
    this.bg = new Image()
    this.bg.src = 'images/play_bg.png'
    this.switch_to_test = new SwitchToTest(screenWidth / 2 - 60, screenHeight / 2 - 100 + 300)
  }
  stop() {
    this.finger_now = [0, 0]
    this.finger_original = [0, 0]
    this.finger_duration = 0
    this.finger_on = false
    this.gyroscope = ""
    this.current_operation = ""
    this.operation_counter = 0
    this.slide_op_detector = 0
    this.bgm.pause()
    canvas.removeEventListener('touchstart', this.touchStartHandler)
    canvas.removeEventListener('touchmove',  this.touchMoveHandler)
    canvas.removeEventListener('touchend', this.touchEndHandler)
    wx.stopGyroscope()
  }
  start() {
    this.bgm.currentTime = 0
    this.bgm.play()
    canvas.addEventListener('touchstart', this.touchStartHandler)
    canvas.addEventListener('touchmove',  this.touchMoveHandler)
    canvas.addEventListener('touchend', this.touchEndHandler)
  }
  touchStartEventHandler(e) {
    e.preventDefault()
    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
    this.finger_original = [x, y]
    this.finger_on = true
    this.finger_duration = false
    this.slide_op_detector = 1
    if (this.switch_to_test.ClickInsideButton(x, y)) {
      this.stop(this.ctx)
      databus.status = databus.STATUS_TEST
    }
  }
  touchMoveEventHandler(e) {
    e.preventDefault()
    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
    this.finger_now = [x, y]
    if (x < this.finger_original[0] - THRESHOLD_SLIDE) {
      this.RecordOperation("左滑", 0) // + (this.finger_original[0] - x), 0)
    } else if (x > this.finger_original[0] + THRESHOLD_SLIDE) {
      this.RecordOperation("右滑", 0) //  + (x - this.finger_original[0]), 0)
    } else if (y < this.finger_original[1] - THRESHOLD_SLIDE) {
      this.RecordOperation("上滑", 0) // + (this.finger_original[1] - y), 0)
    } else if (y > this.finger_original[1] + THRESHOLD_SLIDE) {
      this.RecordOperation("下滑", 0) // + (y - this.finger_original[1]), 0)
    }
  }
  touchEndEventHandler(e) {
    e.preventDefault()
    this.finger_on = false
  }
  render() {
    this.ctx.clearRect(0, 0, canvas.width, canvas.height)
    this.renderMusicInfo()
  }
  renderMusicInfo() {
    this.ctx.fillStyle = "#ffffff"
    this.ctx.font      = "20px Arial"
    this.ctx.fillText("正在播放:沧海一声笑", 10, 50)
    this.ctx.fillText("播放时间:" + this.bgm.currentTime.toFixed(3), 10, 100)
    this.ctx.drawImage(this.bg, screenWidth / 2 - 120, screenHeight / 2 - 150, 240, 300)
    this.switch_to_test.render(this.ctx)
  }
  RecordOperation(operation, type) {
    if (type == 0) {
      if (!this.slide_op_detector)
        return;
      this.slide_op_detector = 0;
    }
    if (type == 1) {
      if (databus.frame - LEAST_OP_INTERVAL_FRAME < this.last_op_frame) {
        return
      }
      this.last_op_frame = databus.frame
    }
    this.current_operation = operation
    this.operation_counter += 1
  }
  update() {
    if (this.finger_on) {
      this.finger_duration += 1
    }
  }
}