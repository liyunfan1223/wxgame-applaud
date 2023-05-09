import DataBus from './databus'

import Index from './status/index'
import Play from './status/play'
import Test from './status/test'
import Store from './status/store'
import Story from './status/story'
import Story_music from './status/story_music'

const ctx = canvas.getContext('2d')
const databus = new DataBus()

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    // 维护当前requestAnimationFrame的id
    this.aniId = 0
    this.restart()
  }

  restart() {
    databus.reset()
    this.prevStatus = databus.status
    this.currentStatus = new Play(ctx)
    this.currentStatus.start()
    this.bindLoop = this.loop.bind(this)
    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId)
    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
  // 实现游戏帧循环
  loop() {
    databus.frame++
    if (databus.status != this.prevStatus) {
      // 游戏状态切换
      this.prevStatus = databus.status
      switch (databus.status) {
        case databus.STATUS_TEST:
          this.currentStatus = new Test(ctx)
          break
        case databus.STATUS_INDEX:
          this.currentStatus = new Index(ctx)
          break
        case databus.STATUS_STORE:
          this.currentStatus = new Store(ctx)
          break
        case databus.STATUS_STORY:
          this.currentStatus = new Story(ctx)
          break
        case databus.STATUS_PLAY:
          this.currentStatus = new Play(ctx)
          break
        case databus.STATUS_STORY_MUSIC:
            this.currentStatus = new Story_music(ctx)
            break
      }
      this.currentStatus.start()
    }
    this.currentStatus.update()
    this.currentStatus.render()
    
    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
}
