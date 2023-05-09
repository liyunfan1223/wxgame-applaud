import Pool from './base/pool'

let instance

/**
 * 全局状态管理器
 */
export default class DataBus {
  constructor() {
    if ( instance )
      return instance
      
    instance = this
    this.STATUS_TEST = 1
    this.STATUS_INDEX = 2
    this.STATUS_STORE = 3
    this.STATUS_STORY = 4
    this.STATUS_PLAY = 5
    this.STATUS_STORY_MUSIC = 6
    // this.pool = new Pool()
    this.reset()
  }

  reset() {
    this.frame      = 0
    this.status = this.STAT
  }
}
