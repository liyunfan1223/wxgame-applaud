import Status from './status'
import GameInfo from '../runtime/gameinfo'
import DataBus from '../databus'
import BackGround from '../runtime/background'
import {SwitchToTest,SquareButton} from '../buttons/buttons'

const databus = new DataBus()
const THRESHOLD_SLIDE = 50

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
    this.story_list=['古琴','笛子']
    this.switch_to_test = new SwitchToTest(screenWidth / 2 - 60, screenHeight / 2 - 100 + 180+60)
  }
  stop() {
    canvas.removeEventListener('touchstart', this.touchStartHandler)
    canvas.removeEventListener('touchmove',  this.touchMoveHandler)
    canvas.removeEventListener('touchend', this.touchEndHandler)
    wx.stopGyroscope()
  }
  start() {
    this.touch_tag=0
    this.operation_counter=0
    this.aud = new Audio('https://fanyi.sogou.com/reventondc/synthesis?text=' + '新的一天开始了！你是一名乐师，目前存款为：0。今日的演出就要开始了！请问你想带哪一个乐器出门呢？'+ '环顾屋子，好像只有自制的古琴和新做的笛子。双指左右滑动切换乐器，下滑进入乐器商店。'  + '&speed=1&lang=zh-CHS&from=translateweb&speaker=6')
    this.aud.play()
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
      this.aud.pause()
      databus.status = databus.STATUS_TEST
    }
    if (this.instrument1.ClickInsideButton(x, y) && this.touch_tag==0) {
      this.stop(this.ctx)
      this.aud.pause()
      databus.status = databus.STATUS_STORY
      databus.instrument = this.story_list[0]
    }
    if (this.instrument2.ClickInsideButton(x, y) && this.touch_tag==0) {
      this.stop(this.ctx)
      this.aud.pause()
      databus.status = databus.STATUS_STORY
      databus.instrument = this.story_list[1]
    }
    if ((this.operation_counter)%this.story_list.length==1 && this.touch_tag==1){
      this.stop(this.ctx)
      this.aud.pause()
      databus.status = databus.STATUS_STORY
      databus.instrument = this.story_list[(this.operation_counter)%4]
    }
  }
  touchMoveEventHandler(e) {
    e.preventDefault()
    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
    this.finger_now = [x, y]
    if (x < this.finger_original[0] - THRESHOLD_SLIDE) {
      this.touch_tag=1
      this.kind='left'
      // console.log(this.story_list.length)
        this.RecordOperation("选中"+this.story_list[(this.operation_counter)%4]+",点击进入", 0,this.kind)
    } else if (x > this.finger_original[0] + THRESHOLD_SLIDE) {
      this.touch_tag=1
      this.kind='right'
        this.RecordOperation("选中"+this.story_list[(this.operation_counter)%4]+",点击进入", 0,this.kind)
      }
    else if (x > this.finger_original[0] + THRESHOLD_SLIDE) {
        this.touch_tag=1
        this.kind='right'
          this.RecordOperation("选中"+this.story_list[(this.operation_counter)%4]+",点击进入", 0,this.kind)
        }
    else if (y > this.finger_original[1] + THRESHOLD_SLIDE) {
          this.touch_tag=1
          this.kind='down'
          this.stop(this.ctx)
          this.aud.pause()
          databus.status = databus.STATUS_STORE
      }
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
    this.ctx.fillText("开始界面", 50, 60)
    this.ctx.fillStyle = "#ffffff"
    this.switch_to_test.render(this.ctx)
    this.instrument1.render(this.ctx)
    this.instrument2.render(this.ctx)
  }
  RecordOperation(operation, type,kind) {
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
    if (kind=='right'){
      this.operation_counter += 1
    }else{
      this.operation_counter -= 1
    }
    // 语音播报
    let aud = new Audio('https://fanyi.sogou.com/reventondc/synthesis?text=' + operation + '&speed=1&lang=zh-CHS&from=translateweb&speaker=6')
    aud.play()
  }
  update() {
  }
}