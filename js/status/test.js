import Status from './status'
import GameInfo from '../runtime/gameinfo'
import DataBus from '../databus'
import BackGround from '../runtime/background'
import {SwitchToIndex, SwitchToStore, SwitchToStory, SwitchToPlay} from '../buttons/buttons'

const databus = new DataBus()

const THRESHOLD_SLIDE = 50
const THRESHOLD_SKEW = 2.0
const LEAST_OP_INTERVAL_FRAME = 60
const screenWidth  = window.innerWidth
const screenHeight = window.innerHeight

let instance
export default class Test extends Status {
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
  init(ctx) {
    // this.bg = new BackGround(ctx)
    this.bg = new Image()
    this.bg.src = 'images/play_bg_logo.jpg'
    this.gameinfo = new GameInfo()
    this.finger_now = [0, 0]
    this.finger_original = [0, 0]
    this.finger_duration = 0
    this.finger_on = false
    this.gyroscope = ""
    this.current_operation = ""
    this.operation_counter = 0
    this.slide_op_detector = 0
    this.switch_to_index = new SwitchToIndex(screenWidth / 2 - 60, screenHeight / 2 + 60)
    // this.switch_to_index = new SwitchToIndex(screenWidth / 2 - 120, screenHeight / 2 + 80)
    // this.switch_to_store = new SwitchToStore(screenWidth / 2, screenHeight / 2 + 80)
    // this.switch_to_story = new SwitchToStory(screenWidth / 2 - 120, screenHeight / 2 + 120)
    // this.switch_to_play = new SwitchToPlay(screenWidth / 2, screenHeight / 2 + 120)
  }
  stop() {
    canvas.removeEventListener('touchstart', this.touchStartHandler)
    canvas.removeEventListener('touchmove',  this.touchMoveHandler)
    canvas.removeEventListener('touchend', this.touchEndHandler)
    wx.stopGyroscope()
  }
  start() {
    this.aud = new Audio('https://fanyi.sogou.com/reventondc/synthesis?text=' + '欢迎来到游戏：蒙眼乐师，倾斜手机，进入游戏！'  + '&speed=1&lang=zh-CHS&from=translateweb&speaker=6')
    this.aud.play()
    this.finger_now = [0, 0]
    this.finger_original = [0, 0]
    this.finger_duration = 0
    this.finger_on = false
    this.hasEventBind = false
    this.gyroscope = ""
    this.current_operation = ""
    this.operation_counter = 0
    this.slide_op_detector = 0
    canvas.addEventListener('touchstart', this.touchStartHandler)
    canvas.addEventListener('touchmove',  this.touchMoveHandler)
    canvas.addEventListener('touchend', this.touchEndHandler)
    wx.startGyroscope()
    wx.onGyroscopeChange((result) => {
      let x = result.x
      let y = result.y
      let z = result.z
      this.gyroscope = [x, y, z]
      if (x > THRESHOLD_SKEW) {
      databus.status = databus.STATUS_INDEX
      // this.RecordOperation("手机下倾", 1)
      } else if (x < -THRESHOLD_SKEW) {
      databus.status = databus.STATUS_INDEX
      // this.RecordOperation("手机上倾", 1)
      } else if (y > THRESHOLD_SKEW) {
      databus.status = databus.STATUS_INDEX
      // this.RecordOperation("手机右倾", 1)
      } else if (y < -THRESHOLD_SKEW) {
      databus.status = databus.STATUS_INDEX
      // this.RecordOperation("手机左倾", 1)
      }
    })
  }
  touchStartEventHandler(e) {
    e.preventDefault()
    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
    this.finger_original = [x, y]
    this.finger_on = true
    this.finger_duration = false
    this.slide_op_detector = 1
    if (this.switch_to_index.ClickInsideButton(x, y)) {
      this.stop()
      this.aud.pause()
      databus.status = databus.STATUS_INDEX
    } 
    // else if (this.switch_to_play.ClickInsideButton(x, y)) {
    //   this.stop()
    //   databus.status = databus.STATUS_PLAY
    // } else if (this.switch_to_store.ClickInsideButton(x, y)) {
    //   this.stop()
    //   databus.status = databus.STATUS_STORE
    // } else if (this.switch_to_story.ClickInsideButton(x, y)) {
    //   this.stop()
    //   databus.status = databus.STATUS_STORY
    // }
  }
  touchMoveEventHandler(e) {
    e.preventDefault()
    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
    this.finger_now = [x, y]
    if (x < this.finger_original[0] - THRESHOLD_SLIDE) {
      // this.RecordOperation("左滑", 0)
    } else if (x > this.finger_original[0] + THRESHOLD_SLIDE) {
      // this.RecordOperation("右滑", 0)
    } else if (y < this.finger_original[1] - THRESHOLD_SLIDE) {
      // this.RecordOperation("上滑", 0)
    } else if (y > this.finger_original[1] + THRESHOLD_SLIDE) {
      // this.RecordOperation("下滑", 0)
    }
  }
  touchEndEventHandler(e) {
    e.preventDefault()
    this.finger_on = false
  }
  render() {
    this.ctx.clearRect(0, 0, canvas.width, canvas.height)
    // this.bg.render(this.ctx)
    this.renderIndicatorInfo()
  }
  renderIndicatorInfo() {
    this.ctx.drawImage(this.bg, 0, 0, canvas.width, canvas.height)
    this.ctx.fillStyle = "#ffffff"
    this.ctx.font      = "20px Arial"
    // this.ctx.fillText("当前位置:" + this.finger_now, 10, 50)
    // this.ctx.fillText("初始位置:" + this.finger_original, 10, 100)
    // this.ctx.fillText("持续时间(帧):" + this.finger_duration, 10, 150)
    // this.ctx.fillText("陀螺仪参数:" + this.gyroscope, 10, 200)
    // this.ctx.fillText("上一次操作识别:" + this.current_operation, 10, 250)
    // this.ctx.fillText("操作数:" + this.operation_counter, 10, 300)
    // this.switch_to_play.render(this.ctx)
    this.switch_to_index.render(this.ctx)
    // this.switch_to_store.render(this.ctx)
    // this.switch_to_story.render(this.ctx)
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
    // 语音播报
    let aud = new Audio('https://fanyi.sogou.com/reventondc/synthesis?text=' + operation + '&speed=1&lang=zh-CHS&from=translateweb&speaker=6')
    aud.play()
  }
  update() {
    // this.bg.update()
    if (this.finger_on) {
      this.finger_duration += 1
    }
  }
}