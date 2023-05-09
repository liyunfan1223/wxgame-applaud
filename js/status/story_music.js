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
export default class Story_music extends Status {
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
    this.story1=new SquareButton(screenWidth / 2 - 110, screenHeight / 2 - 150 ,"沧海笑")
    this.story2=new SquareButton(screenWidth / 2 +10, screenHeight / 2 - 150 ,"待解锁")
    this.story3=new SquareButton(screenWidth / 2 -110, screenHeight / 2 - 150 +110,"待解锁")
    this.story4=new SquareButton(screenWidth / 2 +10, screenHeight / 2 - 150 +110,"待解锁")

    this.story_list=['沧海笑','待解锁','待解锁','待解锁']
    this.switch_to_test = new SwitchToTest(screenWidth / 2 - 60, screenHeight / 2 - 100 + 180+60)
  }
  stop() {
    canvas.removeEventListener('touchstart', this.touchStartHandler)
    canvas.removeEventListener('touchmove',  this.touchMoveHandler)
    canvas.removeEventListener('touchend', this.touchEndHandler)
    wx.stopGyroscope()
  }
  start() {
    this.operation_counter=0
    this.touch_tag=0
    // console.log(111111)
    let aud = new Audio('https://fanyi.sogou.com/reventondc/synthesis?text=' + '请选择演奏的曲目吧！双指左右滑动切换选项。' + '&speed=1&lang=zh-CHS&from=translateweb&speaker=6')
    aud.play()
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
    if (this.switch_to_test.ClickInsideButton(x, y) ) {
      this.stop(this.ctx)
      databus.status = databus.STATUS_TEST
    }
    if (this.story1.ClickInsideButton(x, y) && this.touch_tag==0) {
      this.stop(this.ctx)
      databus.story_music = 1
      // console.log(databus)
      databus.status = databus.STATUS_PLAY
    }
    if ((this.operation_counter-1)%this.story_list.length==0 && this.touch_tag==1){
      this.stop(this.ctx)
      databus.status = databus.STATUS_PLAY
      databus.story = 1
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
      if ((this.operation_counter)%this.story_list.length==0){
        this.RecordOperation("选中"+this.story_list[(this.operation_counter)%4]+",点击进入", 0,this.kind)
      }else{
        this.RecordOperation("关卡待解锁", 0,this.kind)
      }
    
    } else if (x > this.finger_original[0] + THRESHOLD_SLIDE) {
      this.touch_tag=1
      this.kind='right'
      if ((this.operation_counter)%this.story_list.length==0){
        this.RecordOperation("选中"+this.story_list[(this.operation_counter)%4]+",点击进入", 0,this.kind)
      }else{
        this.RecordOperation("关卡待解锁", 0,this.kind)
      }
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
    this.ctx.fillStyle = "#ffffff"
    this.ctx.font      = "20px Arial"
    this.ctx.fillText("剧情界面", 10, 50)
    this.switch_to_test.render(this.ctx)
    this.story1.render(this.ctx)
    this.story2.render(this.ctx)
    this.story3.render(this.ctx)
    this.story4.render(this.ctx)
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