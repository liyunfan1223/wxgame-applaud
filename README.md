## 源码目录介绍

```
./miniprogram/js
├── base                                   // 定义游戏开发基础类
│   ├── animatoin.js                       // 帧动画的简易实现
│   ├── pool.js                            // 对象池的简易实现
│   └── sprite.js                          // 游戏基本元素精灵类
├── libs
│   ├── symbol.js                          // ES6 Symbol简易兼容
│   └── weapp-adapter.js                   // 小游戏适配器
├── runtime
│   ├── background.js                      // 背景类
│   ├── gameinfo.js                        // 用于展示分数和结算界面
│   └── music.js                           // 全局音效管理器
├── databus.js                             // 管控游戏状态
├── status                                 // 游戏状态
│   ├── status.js                          // 状态基类
│   ├── test.js                            // 测试界面
│   ├── index.js                           // 开始界面
│   ├── store.js                           // 商店界面
│   ├── story.js                           // 剧情界面
│   └── play.js                            // 游戏界面
└── main.js                                // 游戏入口主函数

```
