import Status from './status'
import GameInfo from '../runtime/gameinfo'
import DataBus from '../databus'
import BackGround from '../runtime/background'
import {SwitchToTest} from '../buttons/buttons'

const databus = new DataBus()

const THRESHOLD_SLIDE = 30
const THRESHOLD_SKEW = 2.0
const LEAST_OP_INTERVAL_FRAME = 60
const screenWidth  = window.innerWidth
const screenHeight = window.innerHeight
const EST_INTERVAL = 0.925
const FIRST_HIT = 11.8
const HIT_THRESHOLD = 0.3 // 操作时间误差要小于阈值才算
const HIT_DIRECTION_SWITH_TS = [
  18.96, 25.82, 33.23, 40.84, 48.3, 55.3, 63.18
]
const STOP_RECORD_TIME = 70.5

const PHASE_INTRO = 1
const PHASE_INTRO_END = 2
const PHASE_PLAY = 3
const PHASE_PLAY_END = 4

const INTRODUCTION = "《沧海一声笑》灵感来源于古书《乐志》中记载的“大乐必易”。最\“易\”的莫过于中国五声音阶（宫、商、角、徵、羽）。音色婉转动听，声色悠扬，颇具中国古曲风韵。歌词借鉴于《沁园春》，气势磅礴，韵味悠远。"
// 为了让ta把多音字读对，一些字用别的来替代..
const INTRODUCTION_REQ = "《沧海一声笑》灵感来源于古书《乐志》中记载的\“大悦必易\”。最\“易\”的莫过于中国五声音阶（宫、商、觉、止、羽）。音色婉转动听，声色悠扬，颇具中国古曲风韵。歌词借鉴于《沁园春》，气势旁礴，韵味悠远。"
const GANE_INTRO = "在游戏过程中，您需要根据左右声道判断声音位置，在第二和第四拍时刻，向声音来源的方向滑动屏幕完成操作。在您准备好后，向任意方向滑动屏幕开始游戏。"
// const INTRODUCTION_REQ = "haha"
// const GANE_INTRO = "hehe"
let instance

class HitEffect {
  constructor(text, x, y, start_time, gradual_time, direction, speed) {
    this.text = text
    this.x = x
    this.y = y
    this.start_time = start_time
    this.gradual_time = gradual_time
    this.direction = direction
    this.speed = speed
  }
  render(ctx, now) {
    ctx.fillStyle = "#1c1c1c"
    ctx.font      = "20px Arial"
    ctx.globalAlpha = 1 - (now - this.start_time) / this.gradual_time
    let dx = this.x + Math.cos(this.direction) * this.speed * (now - this.start_time)
    let dy = this.y + Math.sin(this.direction) * this.speed * (now - this.start_time)
    ctx.fillText(
      this.text, dx, dy
    )
    ctx.globalAlpha = 1
  }
}
class WebAudioContextWrapper {
  constructor(url) {
    this.url = url
    this.started = false
    this.loadAudio(url).then(buffer => {
      this.source_buffer = buffer
    }).catch(() => {
      console.log('Buffer request fail')
    })
  }
  play() {
    this.ctx = wx.createWebAudioContext()
    this.source = this.ctx.createBufferSource()
    this.source.buffer = this.source_buffer
    this.source.connect(this.ctx.destination)
    this.source.start()
    this.started = true
    this.stopped = false
  }
  stop() {
    if (this.started && !this.stopped) {
      this.stopped = true;
      this.source.stop()
      this.ctx.suspend()
    }
  }
  getTime() {
    return this.ctx.currentTime
  }
  loadAudio(url) {
    return new Promise((resolve) => {
      wx.request({
        url,
        responseType: 'arraybuffer',
        success: res => {
          console.log('res.data', res.data)
          wx.createWebAudioContext().decodeAudioData(res.data, buffer => {
            resolve(buffer)
          }, err => {
            console.error('decodeAudioData fail', err)
            reject()
          })
        },
        fail: res => {
          console.error('request fail', res)
          reject()
        }
      })
    })
  }
}

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
    // 使用 WebAudioContext 获得更好的时间精度
    this.bgm = new WebAudioContextWrapper('https://morphling-picgo.oss-cn-shanghai.aliyuncs.com/chysx_mod_72s.mp3')
    // this.instrument = new WebAudioContextWrapper('audio/instrument_gz.mp3')
    this.bg = new Image()
    this.bg.src = 'images/play_bg.jpg'
    this.bgTime = 75
    this.applaudTime = 8
    this.next_hit = FIRST_HIT
    
    this.score_hit = 0
    this.score_duplicate = 0
    this.score_wrongtime = 0
    this.score_wrongdir = 0
    this.score_miss = 0
    this.current_direction = 0 // 0 -> left, 1 -> right
    this.hit_map = new Map()
    this.hit_effects = []

    this.instrument_mic = wx.createInnerAudioContext({ useWebAudioImplement: true })
    this.instrument_mic.src = 'audio/instrument_gz.mp3'
    this.applaud_mic = wx.createInnerAudioContext({ useWebAudioImplement: true })
    this.applaud_mic.src = 'audio/applaud.mp3'
    this.instrument_pic = new Image()
    this.instrument_pic.src = 'images/gz2.png'
    this.frame_counter = 0
    this.switch_to_test = new SwitchToTest(screenWidth / 2 - 60, screenHeight / 2 - 100 + 300)
    this.intro = this.RequestAudio(INTRODUCTION_REQ + GANE_INTRO)
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

    if (this.result_speak != undefined) {
      this.result_speak.pause()
    }
    this.intro.pause()
    this.bgm.stop()
    canvas.removeEventListener('touchstart', this.touchStartHandler)
    canvas.removeEventListener('touchmove',  this.touchMoveHandler)
    canvas.removeEventListener('touchend', this.touchEndHandler)
    wx.stopGyroscope()
  }
  start() {
    this.currentPhase = PHASE_INTRO
    this.intro.currentTime = 0
    this.score_hit = 0
    this.score_duplicate = 0
    this.score_wrongtime = 0
    this.score_wrongdir = 0
    this.score_miss = 0
    this.current_direction = 0 // 0 -> left, 1 -> right
    this.switch_time = 0
    this.next_hit = FIRST_HIT
    this.hit_map = new Map()
    this.start_ts = (new Date()).getTime()
    this.hit_effects = []
    this.intro.play()
    
    this.applauded = false
    this.intro.addEventListener('ended', () => {
      this.currentPhase = PHASE_INTRO_END
    })
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
      this.stop()
      databus.status = databus.STATUS_TEST
    }
  }
  touchMoveEventHandler(e) {
    e.preventDefault()
    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
    this.finger_now = [x, y]
    if (x < this.finger_original[0] - THRESHOLD_SLIDE) {
      this.RecordOperation("左滑", 0)
    } else if (x > this.finger_original[0] + THRESHOLD_SLIDE) {
      this.RecordOperation("右滑", 0)
    } else if (y < this.finger_original[1] - THRESHOLD_SLIDE) {
      this.RecordOperation("上滑", 0)
    } else if (y > this.finger_original[1] + THRESHOLD_SLIDE) {
      this.RecordOperation("下滑", 0)
    }
  }
  touchEndEventHandler(e) {
    e.preventDefault()
    this.finger_on = false
  }
  render() {
    this.ctx.clearRect(0, 0, canvas.width, canvas.height)
    this.renderMusicInfo()
    if (this.currentPhase == PHASE_PLAY) {
      this.render_hit_effects()
    }
  }
  renderMusicInfo() {
    this.ctx.fillStyle = "#1c1c1c"
    this.ctx.font      = "20px Arial"
    this.ctx.drawImage(this.bg, 0, 0, screenWidth, screenHeight)
    if (this.currentPhase == PHASE_INTRO || this.currentPhase == PHASE_INTRO_END) {
      this.ctx.font      = "20px Arial"
      this.FillTextForMultiLinesWithGradual(INTRODUCTION + "\n" + GANE_INTRO, screenWidth / 2 - 150, 120, 300, 2000, 150, 20)
    } else if (this.currentPhase == PHASE_PLAY) {
      this.ctx.font      = "20px Arial"
      this.ctx.fillText("正在播放:沧海一声笑", screenWidth / 2 - 100, 80)
      this.ctx.fillText("完成进度:" + Math.min(100, (this.bgm.getTime() / this.bgTime * 100)).toFixed(0) + '%', screenWidth / 2 - 80, 120)
      this.ctx.fillText("综合评价:" + this.Evaluate(), screenWidth / 2 - 80, 160)
      // this.ctx.fillText("重复:" + this.score_duplicate, screenWidth / 2 - 80, 200)
      // this.ctx.fillText("遗漏:" + this.score_miss, screenWidth / 2 - 80, 240)
      // this.ctx.fillText("太早或太晚:" + this.score_wrongtime, screenWidth / 2 - 80, 280)
      // this.ctx.fillText("方向错误:" + this.score_wrongdir, screenWidth / 2 - 80, 320)

      this.ctx.globalAlpha = 0.8    
      // let ratio = 2 + (databus.frame % 240 >= 120 ? 240 - databus.frame % 240 : databus.frame % 240) / 100 * 0.2
      let ratio = 2.5
      this.ctx.drawImage(this.instrument_pic, 
        screenWidth / 2 - this.instrument_pic.width / 2 / ratio, 
        screenHeight / 2 - this.instrument_pic.height / 2 / ratio ,
        this.instrument_pic.width / ratio, this.instrument_pic.height / ratio)
        this.ctx.globalAlpha = 1
    } else if (this.currentPhase == PHASE_PLAY_END) {
      this.ctx.font      = "20px Arial"
      this.FillTextForMultiLinesWithGradual(this.result_text, screenWidth / 2 - 150, 120, 300, 2000, 150, 20)
    }
    this.ctx.fillStyle = "#ffffff"
    this.switch_to_test.render(this.ctx)
  }
  render_hit_effects() {
    let now = this.bgm.getTime()
    for (let i = this.hit_effects.length - 1; i >= 0; i--) {
      if (this.hit_effects[i].start_time +  this.hit_effects[i].gradual_time < now) {
        this.hit_effects.splice(i, 1);
      }
    }
    this.hit_effects.forEach((i) => {
      i.render(this.ctx, now)
    })
  }
  RecordOperation(operation, type) {
    if (type == 0) {
      if (!this.slide_op_detector)
      return;
      this.slide_op_detector = 0;
      if (this.currentPhase == PHASE_INTRO || this.currentPhase == PHASE_INTRO_END) {
        this.currentPhase = PHASE_PLAY
        this.start_ts = new Date().getTime()
        this.bgm.play()
      } else if (this.currentPhase == PHASE_PLAY) {
        console.log(this.bgm.getTime())
        if (this.bgm.getTime() >= STOP_RECORD_TIME) {
          return;
        }
        if (Math.abs(this.bgm.getTime() - this.next_hit) <= HIT_THRESHOLD) {
          if ((operation == "左滑" && this.current_direction == 1) || 
              (operation == "右滑" && this.current_direction == 0)) {
            // 方向不对
            this.hit_map[this.next_hit] = '方向不对'
            this.hit_effects.push(
              new HitEffect("注意方向", this.finger_original[0], this.finger_original[1], 
                this.bgm.getTime(), 1, Math.PI * 1.5 + (Math.random() - 0.5) * Math.PI * 0.1, 100 + 100 * Math.random()))
            this.score_wrongdir += 1
            wx.vibrateShort()
          } else if (this.hit_map[this.next_hit] === undefined) {
            this.hit_map[this.next_hit] = '命中'
            this.score_hit++;
            this.hit_effects.push(
              new HitEffect("命中!", this.finger_original[0], this.finger_original[1], 
                this.bgm.getTime(), 1, Math.PI * 1.5 + (Math.random() - 0.5) * Math.PI * 0.1, 100 + 100 * Math.random()))
            this.instrument_mic.play()
          } else {
            // 重复操作
            this.score_duplicate++;
            wx.vibrateShort()
          }
        } else {
          // 时间点不对
          this.score_wrongtime++;
          wx.vibrateShort()
          this.hit_effects.push(
            new HitEffect("注意节拍", this.finger_original[0], this.finger_original[1], 
              this.bgm.getTime(), 1, Math.PI * 1.5 + (Math.random() - 0.5) * Math.PI * 0.1, 100 + 100 * Math.random()))
        }
      } else if (this.currentPhase == PHASE_PLAY_END) {
        this.stop()
        databus.status = databus.STATUS_INDEX
      }
    }
    if (type == 1) {
      if (databus.frame - LEAST_OP_INTERVAL_FRAME < this.last_op_frame) {
        return
      }
      this.last_op_frame = databus.frame
      wx.vibrateLong()
    }
    this.current_operation = operation
    this.operation_counter += 1
  }
  RequestAudio(content) {
    return new Audio('https://fanyi.sogou.com/reventondc/synthesis?text=' + content + '&speed=1&lang=zh-CHS&from=translateweb&speaker=6')
  }
  update() {
    switch (this.currentPhase) {
      case PHASE_INTRO:
        if (this.intro.ended) {
          this.currentPhase = PHASE_INTRO_END
          canvas.addEventListener('touchmove', this.touchMoveHandler)
          canvas.addEventListener('touchend', this.touchEndHandler)
        }
        break;
      case PHASE_INTRO_END:
        break;
      case PHASE_PLAY:
        if (!this.applauded && (new Date()).getTime() >= this.start_ts + this.bgTime * 1000) {
          this.applauded = true
          this.applaud_mic.currentTime = 0
          this.applaud_mic.play()
          this.result_text = '在本首演奏中，您成功演奏'+ this.HitRatio().toFixed(0) + '%的乐谱，综合评价为' + this.Evaluate() + '。获得观众打赏' + (10 + this.HitRatio()).toFixed(0) + '文! 目前存款' + (10 + this.HitRatio()).toFixed(0) +'文。\n向任意方向滑动屏幕返回首页。'
          this.result_text_for_request = '在本首演奏中，您成功演奏百分之'+ this.HitRatio().toFixed(0) + '的乐谱，综合评价为' + this.Evaluate() + '。获得观众打赏' + (10 + this.HitRatio()).toFixed(0) + '文! 目前存款' + (10 + this.HitRatio()).toFixed(0) +'文。\n向任意方向滑动屏幕返回首页。'
          console.log(this.result_text)
          this.result_speak = this.RequestAudio(this.result_text_for_request)
          this.result_hasspoke = false
          // this.bgm.stop()
          break;
        }
        if ((new Date()).getTime() >= this.start_ts + (this.applaudTime + this.bgTime) * 1000) {
          this.currentPhase = PHASE_PLAY_END
          this.start_ts = new Date().getTime()
        }
        if (this.bgm.getTime() >= STOP_RECORD_TIME) {
          break;
        }
        if (this.switch_time < HIT_DIRECTION_SWITH_TS.length && 
            this.bgm.getTime() > HIT_DIRECTION_SWITH_TS[this.switch_time]) {
          this.switch_time++
          this.current_direction = 1 - this.current_direction
        }
        if (this.bgm.getTime() >= this.next_hit + HIT_THRESHOLD) {
          if (this.hit_map[this.next_hit] === undefined) {
            wx.vibrateShort()
            this.score_miss += 1
            this.hit_effects.push(new HitEffect("错过了", screenWidth / 2 - 25 + 50 * (Math.random() - 0.5), screenHeight / 2 - 150, 
                this.bgm.getTime(), 1, Math.PI * 1.5 + (Math.random() - 0.5) * Math.PI * 0.05, 100 + 100 * Math.random()))
          }
          this.next_hit += EST_INTERVAL
        }
        
        break;
      case PHASE_PLAY_END:
        if (!this.result_hasspoke) {
          this.result_hasspoke = true
          this.result_speak.play()
        }
        break;
    }
    if (this.finger_on) {
      this.finger_duration += 1
    }
    if (this.currentPhase != PHASE_INTRO) {
      this.intro.pause()
    }
  }
  FillTextForMultiLinesWithGradual(text, x, y, w, gradual, interval, text_px)
  {
    this.ctx.font      = text_px + "px Arial"
    let char_per_line = w / text_px
    let ix = 0
    let iy = 0
    let ts = (new Date()).getTime() - this.start_ts
    for (let i = 0; i < text.length; i++) {
      if (text.charAt(i) == '\n') {
        ix = 0
        iy++
      } else if (this.HalfSizeChar(text.charAt(i - 1))) {
        ix += 0.5
      } else {
        ix++
      }
      if (ix >= char_per_line) {
        ix = 0
        iy++
      }
      let dx = x + ix * text_px
      let dy = y + iy * (text_px + 10) // y + Math.floor(i / char_per_line) * 20
      // console.log(dx, dy)
      if (ts < i * interval)
        this.ctx.globalAlpha = 0
      else {
        this.ctx.globalAlpha = Math.min(1, (ts - i * interval) / gradual)
      }
      this.ctx.fillText(text.charAt(i), dx, dy)
    }
    this.frame_counter++;
    this.ctx.globalAlpha = 1
  }
  HalfSizeChar(ch) {
    return ch == '”' || ch == '“' || (ch >= '0' && ch <= '9') || ch == '!'
  }
  HitRatio() {
    let tot = this.score_hit + this.score_duplicate + this.score_wrongdir + this.score_wrongtime + this.score_miss
    let hit_ratio = (this.score_hit) / (tot) * 100
    return isNaN(hit_ratio) ? 100 : hit_ratio
  }
  Evaluate() {
    // 返回 S / A / B / C / D / F
    let tot = this.score_hit + this.score_duplicate + this.score_wrongdir + this.score_wrongtime + this.score_miss
    let hit_ratio = (this.score_hit + 20) / (tot + 20)
    if (hit_ratio > 0.95) {
      return 'S';
    } else if (hit_ratio > 0.9) {
      return 'A';
    } else if (hit_ratio > 0.8) {
      return 'B';
    } else if (hit_ratio > 0.6) {
      return 'C'
    } else if (hit_ratio > 0.3) {
      return 'D'
    } else return 'F'
  }
}
