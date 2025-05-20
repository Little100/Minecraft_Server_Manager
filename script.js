const body = document.body
const cursorDot = document.getElementById("cursor-dot")
const cursorOutline = document.getElementById("cursor-outline")
const navLinks = document.querySelectorAll(".nav-link")
const sections = document.querySelectorAll(".section")
const featureCards = document.querySelectorAll(".feature-card")
const interactiveCube = document.getElementById("interactive-cube")
const interactiveBackground = document.getElementById("interactive-background")
const consoleOutput = document.getElementById("console-output")
const commandInput = document.getElementById("command-input")
const minecraftWorld = document.getElementById("minecraft-world")
const mainContent = document.getElementById("main-content")
const worldContainer = document.getElementById("world-container")
const minecraftThemeOption = document.querySelector(".minecraft-theme-option")
const sunIcon = document.querySelector(".sun-icon")
const moonIcon = document.querySelector(".moon-icon")
const minecraftIcon = document.querySelector(".minecraft-icon")

const BLOCK_SIZE = 40
const WORLD_WIDTH = Math.ceil(window.innerWidth / BLOCK_SIZE) + 1
const WORLD_HEIGHT = Math.ceil(window.innerHeight / BLOCK_SIZE) * 3
const SURFACE_LEVEL = Math.floor(window.innerHeight / BLOCK_SIZE / 2)

const BLOCKS = {
  "grass-block": { hardness: 0.6, layer: 0 },
  dirt: { hardness: 0.5, layer: 1 },
  stone: { hardness: 1.5, layer: 2 },
  cobble: { hardness: 2, layer: 2 },
  "cobbled-deepslate": { hardness: 3, layer: 3 },
  deepslate: { hardness: 3, layer: 3 },
  "coal-ore": { hardness: 3, layer: 2, rarity: 0.15 },
  "deepslate-coal-ore": { hardness: 4, layer: 3, rarity: 0.15 },
  "iron-ore": { hardness: 3, layer: 2, rarity: 0.1 },
  "copper-ore": { hardness: 3, layer: 2, rarity: 0.1 },
  "deepslate-copper-ore": { hardness: 4, layer: 3, rarity: 0.1 },
  "gold-ore": { hardness: 3, layer: 3, rarity: 0.08 },
  "deepslate-gold-ore": { hardness: 4, layer: 3, rarity: 0.08 },
  "lapis-lazuli-ore": { hardness: 3, layer: 2, rarity: 0.07 },
  "deepslate-lapis-lazuli-ore": { hardness: 4, layer: 3, rarity: 0.07 },
  "redstone-ore": { hardness: 3, layer: 3, rarity: 0.07 },
  "deepslate-redstone-ore": { hardness: 4, layer: 3, rarity: 0.07 },
  "diamond-ore": { hardness: 3, layer: 3, rarity: 0.05 },
  "deepslate-diamond-ore": { hardness: 4, layer: 3, rarity: 0.05 },
  "emerald-ore": { hardness: 3, layer: 3, rarity: 0.03 },
  "deepslate-emerald-ore": { hardness: 4, layer: 3, rarity: 0.03 },
  "oak-log": { hardness: 2, layer: 0 },
  "oak-leaves": { hardness: 0.2, layer: 0, transparent: true },
}

let worldData = []
let backgroundWorldData = []
let cameraY = 0
let torches = []
let lichens = []
let trees = []
let miningBlock = null
let miningProgress = 0
let miningInterval = null
let lastMiningTime = 0

function initWorld() {
  worldData = []
  backgroundWorldData = []
  trees = []
  torches = []
  lichens = []

  // 初始化世界数据
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    worldData[y] = []
    backgroundWorldData[y] = []
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const blockType = getBlockTypeForPosition(x, y)
      worldData[y][x] = blockType

      // 为背景层创建暗色版本的方块
      if (blockType) {
        backgroundWorldData[y][x] = blockType
      } else {
        // 如果当前位置没有方块，则根据深度生成背景方块
        if (y > SURFACE_LEVEL * 2) {
          backgroundWorldData[y][x] = "deepslate"
        } else if (y > SURFACE_LEVEL + 3) {
          backgroundWorldData[y][x] = "stone"
        } else if (y > SURFACE_LEVEL) {
          backgroundWorldData[y][x] = "dirt"
        }
      }
    }
  }

  // 生成树木
  generateTrees()

  // 生成发光地衣
  for (let i = 0; i < WORLD_WIDTH * 0.5; i++) {
    const x = Math.floor(Math.random() * WORLD_WIDTH)
    const y = Math.floor(SURFACE_LEVEL * 2 + Math.random() * SURFACE_LEVEL)
    if (y < WORLD_HEIGHT) {
      lichens.push({ x, y })
    }
  }

  renderWorld()
  setupEventListeners()
}

const repoUrl = "https://api.github.com/repos/Little100/Minecraft_Server_Manager"
fetch(repoUrl)
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("stars").textContent = `Stars: ${data.stargazers_count}`
    document.getElementById("forks").textContent = `Forks: ${data.forks_count}`
  })
  .catch((error) => {
    console.error("Error:", error)
  })

fetch(`${repoUrl}/contributors`)
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("contributors").textContent = `贡献者: ${data.length}`
  })
  .catch((error) => {
    console.error("Error:", error)
  })

// 替换原有的主题相关变量和函数
const darkThemeButton = document.getElementById("dark-theme-button")
const lightThemeButton = document.getElementById("light-theme-button")
const minecraftThemeButton = document.getElementById("minecraft-theme-button")
let currentTheme = "dark"
let isMinecraftMode = false

// 根据浏览器主题设置默认主题
function setInitialTheme() {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    currentTheme = "light"
    body.classList.add("light-theme")
    lightThemeButton.classList.add("active")
  } else {
    darkThemeButton.classList.add("active")
  }
}

// 切换到暗色主题
darkThemeButton.addEventListener("click", () => {
  if (currentTheme === "dark" && !isMinecraftMode) return

  // 移除所有主题类
  body.classList.remove("light-theme")
  body.classList.remove("minecraft-mode")

  // 移除所有按钮的active类
  darkThemeButton.classList.add("active")
  lightThemeButton.classList.remove("active")
  minecraftThemeButton.classList.remove("active")

  // 设置当前主题
  currentTheme = "dark"
  isMinecraftMode = false

  // 隐藏Minecraft世界，显示主内容
  minecraftWorld.classList.add("hidden")
  mainContent.style.display = "block"
})

// 切换到亮色主题
lightThemeButton.addEventListener("click", () => {
  if (currentTheme === "light" && !isMinecraftMode) return

  // 移除所有主题类
  body.classList.add("light-theme")
  body.classList.remove("minecraft-mode")

  // 移除所有按钮的active类
  darkThemeButton.classList.remove("active")
  lightThemeButton.classList.add("active")
  minecraftThemeButton.classList.remove("active")

  // 设置当前主题
  currentTheme = "light"
  isMinecraftMode = false

  // 隐藏Minecraft世界，显示主内容
  minecraftWorld.classList.add("hidden")
  mainContent.style.display = "block"
})

// 切换到Minecraft主题
minecraftThemeButton.addEventListener("click", () => {
  if (isMinecraftMode) return

  // 移除所有主题类
  body.classList.remove("light-theme")
  body.classList.add("minecraft-mode")

  // 移除所有按钮的active类
  darkThemeButton.classList.remove("active")
  lightThemeButton.classList.remove("active")
  minecraftThemeButton.classList.add("active")

  // 设置当前主题
  isMinecraftMode = true

  // 显示Minecraft世界，隐藏主内容
  minecraftWorld.classList.remove("hidden")
  mainContent.style.display = "none"
  initWorld()
})

// 主题选项点击事件
if (minecraftThemeOption) {
  minecraftThemeOption.addEventListener("click", () => {
    // 切换到Minecraft主题
    body.classList.remove("light-theme")
    body.classList.add("minecraft-mode")

    // 移除所有按钮的active类
    darkThemeButton.classList.remove("active")
    lightThemeButton.classList.remove("active")
    minecraftThemeButton.classList.add("active")

    // 设置当前主题
    isMinecraftMode = true

    // 显示Minecraft世界，隐藏主内容
    minecraftWorld.classList.remove("hidden")
    mainContent.style.display = "none"
    initWorld()
  })
}

// 在DOMContentLoaded事件中设置初始主题
window.addEventListener("DOMContentLoaded", () => {
  setInitialTheme()
  // 其他DOMContentLoaded事件处理...
})

if (minecraftThemeOption) {
  minecraftThemeOption.addEventListener("click", () => {
    currentTheme = "minecraft"
    body.classList.remove("light-theme")
    body.classList.add("minecraft-mode")
    isMinecraftMode = true
    minecraftWorld.classList.remove("hidden")
    mainContent.style.display = "none"
    updateThemeIcons()
    localStorage.setItem("theme", currentTheme)
    localStorage.setItem("minecraftMode", isMinecraftMode)
    initWorld()
  })
}

if (currentTheme === "light") {
  body.classList.add("light-theme")
}

if (currentTheme === "minecraft") {
  body.classList.add("minecraft-mode")
  minecraftWorld.classList.remove("hidden")
  mainContent.style.display = "none"
  window.addEventListener("DOMContentLoaded", initWorld)
}

// 修复updateThemeIcons函数，确保它不会在元素不存在时出错
function updateThemeIcons() {
  if (!sunIcon || !moonIcon || !minecraftIcon) return

  if (currentTheme === "dark") {
    sunIcon.style.display = "block"
    moonIcon.style.display = "none"
    minecraftIcon.style.display = "none"
  } else if (currentTheme === "light") {
    sunIcon.style.display = "none"
    moonIcon.style.display = "block"
    minecraftIcon.style.display = "none"
  } else if (currentTheme === "minecraft") {
    sunIcon.style.display = "none"
    moonIcon.style.display = "none"
    minecraftIcon.style.display = "block"
  }
}

function updateCursor(e) {
  const posX = e.clientX
  const posY = e.clientY

  cursorDot.style.left = `${posX}px`
  cursorDot.style.top = `${posY}px`

  cursorOutline.animate(
    {
      left: `${posX}px`,
      top: `${posY}px`,
    },
    { duration: 500, fill: "forwards" },
  )
}

// 修复document.addEventListener("mousemove", ...)事件，确保cursorDot和cursorOutline存在
document.addEventListener("mousemove", (e) => {
  if (cursorDot && cursorOutline) {
    updateCursor(e)
  }
})

const interactiveElements = document.querySelectorAll("a, button, .feature-card, .theme-option")

interactiveElements.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursorOutline.style.width = "60px"
    cursorOutline.style.height = "60px"
    cursorOutline.style.opacity = "0.3"
  })

  el.addEventListener("mouseleave", () => {
    cursorOutline.style.width = "40px"
    cursorOutline.style.height = "40px"
    cursorOutline.style.opacity = "0.5"
  })
})

document.addEventListener("mouseenter", () => {
  cursorDot.classList.add("active")
  cursorOutline.classList.add("active")
})

document.addEventListener("mouseleave", () => {
  cursorDot.classList.remove("active")
  cursorOutline.classList.remove("active")
})

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault()
    const targetId = link.getAttribute("href").substring(1)
    showSection(targetId)
  })
})

function showSection(sectionId) {
  sections.forEach((section) => {
    section.classList.remove("active")
  })
  document.getElementById(sectionId).classList.add("active")

  history.pushState(null, null, `#${sectionId}`)
}

window.addEventListener("load", () => {
  if (window.location.hash) {
    const sectionId = window.location.hash.substring(1)
    showSection(sectionId)
  }
})

window.addEventListener("scroll", () => {
  const header = document.querySelector("header")
  if (window.scrollY > 50) {
    header.style.boxShadow = "0 5px 20px rgba(0, 0, 0, 0.1)"
    header.style.backdropFilter = "blur(20px)"
  } else {
    header.style.boxShadow = "none"
    header.style.backdropFilter = "blur(10px)"
  }
})

let isDragging = false
let previousX = 0
let previousY = 0
let rotateX = 0
let rotateY = 0
const cube = interactiveCube.querySelector(".cube")

rotateX = Math.random() * 360
rotateY = Math.random() * 360
updateCubeRotation()

interactiveCube.addEventListener("mousedown", (e) => {
  isDragging = true
  previousX = e.clientX
  previousY = e.clientY
  interactiveCube.style.cursor = "grabbing"
})

// 修复document.addEventListener("mouseup", ...)事件，确保interactiveCube存在
document.addEventListener("mouseup", () => {
  isDragging = false
  if (interactiveCube) {
    interactiveCube.style.cursor = "grab"
  }
})

// 修复document.addEventListener("mousemove", ...)事件，确保在拖动时更新立方体旋转
document.addEventListener("mousemove", (e) => {
  if (!isDragging) return

  const deltaX = e.clientX - previousX
  const deltaY = e.clientY - previousY

  rotateY += deltaX * -0.5
  rotateX += deltaY * -0.5

  if (cube) {
    updateCubeRotation()
  }

  previousX = e.clientX
  previousY = e.clientY
})

function updateCubeRotation() {
  cube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
}

let autoRotateInterval

function startAutoRotate() {
  autoRotateInterval = setInterval(() => {
    if (!isDragging) {
      rotateY += 0.2
      updateCubeRotation()
    }
  }, 20)
}

function stopAutoRotate() {
  clearInterval(autoRotateInterval)
}

interactiveCube.addEventListener("mouseenter", stopAutoRotate)
interactiveCube.addEventListener("mouseleave", () => {
  isDragging = false
  startAutoRotate()
})

startAutoRotate()

featureCards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20

    card.style.transform = `perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg) translateZ(10px)`
  })

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateZ(0)"
  })
})

const contactForm = document.querySelector(".contact-form")
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const formData = new FormData(contactForm)

    contactForm.innerHTML = `
            <div class="success-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h3>消息已发送！</h3>
                <p>感谢您的联系，我们会尽快回复您。</p>
            </div>
        `
  })
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()

    const targetId = this.getAttribute("href").substring(1)
    showSection(targetId)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  })
})

// 确保所有DOM元素的引用都在DOMContentLoaded事件中进行
// 修改DOMContentLoaded事件处理函数
window.addEventListener("DOMContentLoaded", () => {
  // 设置初始主题
  setInitialTheme()

  // 添加页面加载类
  document.body.classList.add("loaded")

  // 设置特性卡片动画
  if (featureCards) {
    featureCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = "1"
        card.style.transform = "translateY(0)"
      }, 100 * index)
    })
  }

  // 添加标题效果
  document.querySelectorAll(".section-title").forEach((title) => {
    title.classList.add("shine-effect")
  })

  // 初始化控制台和背景
  initConsole()
  initInteractiveBackground()

  // 显示移动设备通知
  if (window.innerWidth < 768) {
    const mobileNotice = document.getElementById("mobile-notice")
    if (mobileNotice) {
      mobileNotice.style.display = "block"

      const closeButton = document.getElementById("close-mobile-notice")
      if (closeButton) {
        closeButton.addEventListener("click", () => {
          mobileNotice.style.display = "none"
        })
      }
    }
  }

  // 重新绑定导航链接事件
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const targetId = link.getAttribute("href").substring(1)
      showSection(targetId)
    })
  })

  // 重新绑定立方体事件
  const interactiveCube = document.getElementById("interactive-cube")
  if (interactiveCube) {
    const cube = interactiveCube.querySelector(".cube")
    if (cube) {
      rotateX = Math.random() * 360
      rotateY = Math.random() * 360
      updateCubeRotation()

      interactiveCube.addEventListener("mousedown", (e) => {
        isDragging = true
        previousX = e.clientX
        previousY = e.clientY
        interactiveCube.style.cursor = "grabbing"
      })

      interactiveCube.addEventListener("mouseenter", stopAutoRotate)
      interactiveCube.addEventListener("mouseleave", () => {
        isDragging = false
        startAutoRotate()
      })

      startAutoRotate()
    }
  }

  // 重新绑定其他链接事件
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const targetId = this.getAttribute("href").substring(1)
      showSection(targetId)
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    })
  })

  // 检查URL哈希并显示相应部分
  if (window.location.hash) {
    const sectionId = window.location.hash.substring(1)
    showSection(sectionId)
  }
})

function initConsole() {
  const commandHistory = []
  let historyIndex = -1
  let currentInput = ""

  const commands = ["help", "status", "list", "start", "stop", "restart", "backup", "plugins", "version"]

  const responses = {
    help: "可用命令: help, status, list, start, restart, backup, plugins, version",
    status: "服务器状态: 运行中 | 在线玩家: 2 | TPS: 20.0 | 内存: 2.4GB/4GB",
    list: "在线玩家 (2): Steve, Alex",
    start: "服务器已经在运行中",
    stop: "正在停止服务器...",
    restart: "正在重启服务器...",
    backup: "创建备份中... 完成! 备份ID: #143",
    plugins: "已安装插件 (25): Essentials, WorldEdit, WorldGuard, Vault, LuckPerms...",
    version: "MSM服务器管理器 v2.5.1 | Paper 1.20.4 build #254",
  }

  const cursorLine = document.querySelector(".console-line.cursor")
  const initialLines = document.querySelectorAll(".console-output .console-line:not(.cursor)")
  initialLines.forEach((line) => line.remove())

  const initialConsoleLines = [
    { text: "正在启动服务器...", type: "info", delay: 300 },
    { text: "加载服务器属性", type: "info", delay: 500 },
    { text: '准备世界 "world"', type: "info", delay: 700 },
    { text: '准备世界 "world_nether"', type: "info", delay: 900 },
    { text: '准备世界 "world_the_end"', type: "info", delay: 1100 },
    { text: "检测到 16GB 内存，建议分配至少 4GB 给服务器", type: "warn", delay: 1300 },
    { text: "加载 25 个已安装插件", type: "info", delay: 1500 },
    { text: "[MSM] 服务器管理器已启动", type: "success", delay: 1700 },
    { text: "[MSM] 正在监控服务器", type: "success", delay: 1900 },
    { text: "服务器准备完毕! 用时 (9.541s)", type: "info", delay: 2100 },
    { text: "服务器地址: 0.0.0.0:25565", type: "info", delay: 2300 },
    { text: "玩家 Steve 已连接", type: "info", delay: 3000 },
    { text: "玩家 Alex 已连接", type: "info", delay: 4000 },
    { text: "检测到 TPS 下降: 19.5", type: "warn", delay: 5000 },
    { text: "[MSM] 请检查服务器状况以恢复TPS正常值", type: "success", delay: 5500 },
    { text: "[MSM] 恢复正常，TPS 恢复: 20.0", type: "success", delay: 6000 },
    { text: "已创建自动备份 #142", type: "info", delay: 7000 },
  ]

  function addConsoleLine(text, type = "info") {
    const time = new Date().toTimeString().split(" ")[0]
    const line = document.createElement("div")
    line.className = "console-line"
    line.innerHTML = `<span class="time">[${time}]</span> <span class="${type}">${text}</span>`

    consoleOutput.insertBefore(line, cursorLine)
    consoleOutput.scrollTop = consoleOutput.scrollHeight
  }

  initialConsoleLines.forEach((line, index) => {
    setTimeout(() => {
      addConsoleLine(line.text, line.type)
    }, line.delay)
  })

  document.addEventListener("keydown", (e) => {
    if (!document.querySelector("#home.active")) return

    if (e.key === "Enter") {
      const command = commandInput.textContent.trim()
      if (command) {
        addConsoleLine(`> ${command}`, "prompt")

        if (commands.includes(command)) {
          addConsoleLine(responses[command], command === "stop" || command === "restart" ? "warn" : "success")

          if (command === "stop") {
            setTimeout(() => {
              addConsoleLine("服务器已停止", "info")
            }, 1000)
          } else if (command === "restart") {
            setTimeout(() => {
              addConsoleLine("服务器已停止", "info")
            }, 1000)
            setTimeout(() => {
              addConsoleLine("正在启动服务器...", "info")
            }, 2000)
            setTimeout(() => {
              addConsoleLine("服务器已启动", "success")
            }, 3000)
          }
        } else {
          addConsoleLine(`未知命令: ${command}. 输入 'help' 获取帮助`, "error")
        }

        commandHistory.push(command)
        historyIndex = -1
        currentInput = ""
        commandInput.textContent = ""
      }
    } else if (e.key === "ArrowUp") {
      if (historyIndex === -1) {
        currentInput = commandInput.textContent
      }

      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        historyIndex++
        commandInput.textContent = commandHistory[commandHistory.length - 1 - historyIndex]
      }
      e.preventDefault()
    } else if (e.key === "ArrowDown") {
      if (historyIndex > 0) {
        historyIndex--
        commandInput.textContent = commandHistory[commandHistory.length - 1 - historyIndex]
      } else if (historyIndex === 0) {
        historyIndex = -1
        commandInput.textContent = currentInput
      }
      e.preventDefault()
    } else if (e.key === "Tab") {
      e.preventDefault()
      const input = commandInput.textContent.trim()
      if (input) {
        const matches = commands.filter((cmd) => cmd.startsWith(input))
        if (matches.length === 1) {
          commandInput.textContent = matches[0]
        }
      }
    }
  })

  setInterval(() => {
    const randomEvents = [
      { text: "玩家 Notch 已连接", type: "info", probability: 0.1 },
      { text: "玩家 Jeb_ 已连接", type: "info", probability: 0.1 },
      { text: "玩家 Steve 已断开连接", type: "info", probability: 0.05 },
      { text: "检测到高CPU使用率: 85%", type: "warn", probability: 0.03 },
      { text: "[MSM] 自动备份已完成", type: "success", probability: 0.08 },
    ]

    randomEvents.forEach((event) => {
      if (Math.random() < event.probability) {
        addConsoleLine(event.text, event.type)
      }
    })
  }, 8000)
}

function initInteractiveBackground() {
  const interactiveBackground = document.getElementById("interactive-background")
  if (!interactiveBackground) {
    return
  }

  const colors = ["#6558F5", "#1BF7E9", "#FFD740", "#FF5252", "#00E676"]
  const particleCount = 50
  const particles = []

  function createParticle(x, y) {
    const particle = document.createElement("div")
    particle.className = "particle"
    particle.style.left = `${x}px`
    particle.style.top = `${y}px`
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    particle.style.width = `${Math.random() * 5 + 2}px`
    particle.style.height = particle.style.width

    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 1 + 0.5
    particle.velocityX = Math.cos(angle) * speed
    particle.velocityY = Math.sin(angle) * speed

    interactiveBackground.appendChild(particle)
    particles.push(particle)

    setTimeout(() => {
      particle.remove()
      particles.splice(particles.indexOf(particle), 1)
    }, 5000)
  }

  function updateParticles() {
    particles.forEach((particle) => {
      const x = Number.parseFloat(particle.style.left)
      const y = Number.parseFloat(particle.style.top)
      particle.style.left = `${x + particle.velocityX}px`
      particle.style.top = `${y + particle.velocityY}px`

      if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) {
        particle.remove()
        particles.splice(particles.indexOf(particle), 1)
      }
    })
    requestAnimationFrame(updateParticles)
  }

  function addParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      createParticle(x, y)
    }
  }

  for (let i = 0; i < particleCount; i++) {
    createParticle(Math.random() * window.innerWidth, Math.random() * window.innerHeight)
  }

  document.addEventListener("mousemove", (e) => {
    if (Math.random() < 0.1) {
      addParticles(e.clientX, e.clientY, 2)
    }
  })

  document.addEventListener("click", (e) => {
    addParticles(e.clientX, e.clientY, 10)
  })

  updateParticles()
}

function generateTrees() {
  // 在地表随机生成树木
  const treeCount = Math.floor(WORLD_WIDTH / 15) // 控制树木密度

  for (let i = 0; i < treeCount; i++) {
    const x = Math.floor(Math.random() * (WORLD_WIDTH - 10)) + 5 // 避免树木太靠近边缘
    const y = SURFACE_LEVEL - 1 // 树干底部位置（在草方块上方）

    // 检查是否有足够的空间生成树木
    if (x > 2 && x < WORLD_WIDTH - 3) {
      plantTree(x, y)
    }
  }
}

function plantTree(x, y) {
  // 树干
  for (let i = 0; i < 3; i++) {
    worldData[y - i][x] = "oak-log"
  }

  // 树叶 - 按照表格中的模式
  // 第一层树叶（最底层）
  worldData[y - 3][x - 2] = "oak-leaves"
  worldData[y - 3][x - 1] = "oak-leaves"
  worldData[y - 3][x] = "oak-log" // 树干延伸
  worldData[y - 3][x + 1] = "oak-leaves"
  worldData[y - 3][x + 2] = "oak-leaves"

  // 第二层树叶
  worldData[y - 4][x - 2] = "oak-leaves"
  worldData[y - 4][x - 1] = "oak-leaves"
  worldData[y - 4][x] = "oak-log" // 树干延伸
  worldData[y - 4][x + 1] = "oak-leaves"
  worldData[y - 4][x + 2] = "oak-leaves"

  // 第三层树叶
  worldData[y - 5][x - 1] = "oak-leaves"
  worldData[y - 5][x] = "oak-leaves" // 顶部是树叶，不是树干
  worldData[y - 5][x + 1] = "oak-leaves"

  // 第四层树叶（顶层）
  worldData[y - 6][x - 1] = "oak-leaves"
  worldData[y - 6][x] = "oak-leaves"
  worldData[y - 6][x + 1] = "oak-leaves"

  // 记录树的位置
  trees.push({ x, y })
}

function getBlockTypeForPosition(x, y) {
  if (y === SURFACE_LEVEL) {
    return "grass-block"
  }

  if (y > SURFACE_LEVEL && y <= SURFACE_LEVEL + 3) {
    return "dirt"
  }

  if (y > SURFACE_LEVEL + 3 && y <= SURFACE_LEVEL * 2) {
    const oreRoll = Math.random()
    if (oreRoll < 0.15) {
      return "coal-ore"
    } else if (oreRoll < 0.25) {
      return "iron-ore"
    } else if (oreRoll < 0.3) {
      return "copper-ore"
    }
    return "stone"
  }

  if (y > SURFACE_LEVEL * 2) {
    const oreRoll = Math.random()
    if (oreRoll < 0.1) {
      return "deepslate-coal-ore"
    } else if (oreRoll < 0.15) {
      return "deepslate-copper-ore"
    } else if (oreRoll < 0.2) {
      return "deepslate-gold-ore"
    } else if (oreRoll < 0.25) {
      return "deepslate-lapis-lazuli-ore"
    } else if (oreRoll < 0.3) {
      return "deepslate-redstone-ore"
    } else if (oreRoll < 0.33) {
      return "deepslate-diamond-ore"
    } else if (oreRoll < 0.35) {
      return "deepslate-emerald-ore"
    } else if (oreRoll < 0.5) {
      return "cobbled-deepslate"
    }
    return "deepslate"
  }

  return null
}

function renderWorld() {
  worldContainer.innerHTML = ""

  const startY = Math.max(0, Math.floor(cameraY / BLOCK_SIZE))
  const endY = Math.min(WORLD_HEIGHT, startY + Math.ceil(window.innerHeight / BLOCK_SIZE) + 1)

  // 添加黑暗覆盖层
  const darknessOverlay = document.createElement("div")
  darknessOverlay.className = "darkness-overlay"
  worldContainer.appendChild(darknessOverlay)

  // 先渲染背景层
  for (let y = startY; y < endY; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const blockType = backgroundWorldData[y][x]
      if (blockType && !worldData[y][x]) {
        createBackgroundBlock(x, y, blockType)
      }
    }
  }

  // 渲染前景层 - 先渲染非树叶和非树干方块
  for (let y = startY; y < endY; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const blockType = worldData[y][x]
      if (blockType && blockType !== "oak-leaves" && blockType !== "oak-log") {
        createBlock(x, y, blockType)
      }
    }
  }

  // 渲染树干
  for (let y = startY; y < endY; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const blockType = worldData[y][x]
      if (blockType === "oak-log") {
        createBlock(x, y, blockType)
      }
    }
  }

  // 最后渲染树叶
  for (let y = startY; y < endY; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const blockType = worldData[y][x]
      if (blockType === "oak-leaves") {
        createBlock(x, y, blockType)
      }
    }
  }

  // 渲染发光地衣
  lichens.forEach((lichen) => {
    if (lichen.y >= startY && lichen.y < endY) {
      createGlowLichen(lichen.x, lichen.y)
    }
  })

  // 渲染火把
  torches.forEach((torch) => {
    if (torch.y >= startY && torch.y < endY) {
      createTorch(torch.x, torch.y)
    }
  })

  updateDarkness()
}

function createBackgroundBlock(x, y, blockType) {
  const block = document.createElement("div")
  block.className = "block background-block"
  block.dataset.x = x
  block.dataset.y = y
  block.dataset.type = blockType

  block.style.width = `${BLOCK_SIZE}px`
  block.style.height = `${BLOCK_SIZE}px`
  block.style.left = `${x * BLOCK_SIZE}px`
  block.style.top = `${y * BLOCK_SIZE - cameraY}px`
  block.style.backgroundImage = `url('bg-img/${blockType}.png')`
  block.style.filter = "brightness(0.5)" // 使背景方块变暗
  block.style.zIndex = "1" // 确保背景方块在最底层

  worldContainer.appendChild(block)
  return block
}

function createBlock(x, y, blockType) {
  const block = document.createElement("div")
  block.className = "block"

  // 为特定方块类型添加额外的类名
  if (blockType === "oak-leaves") {
    block.classList.add("oak-leaves")
  } else if (blockType === "oak-log") {
    block.classList.add("oak-log")
  }

  block.dataset.x = x
  block.dataset.y = y
  block.dataset.type = blockType

  block.style.width = `${BLOCK_SIZE}px`
  block.style.height = `${BLOCK_SIZE}px`
  block.style.left = `${x * BLOCK_SIZE}px`
  block.style.top = `${y * BLOCK_SIZE - cameraY}px`
  block.style.backgroundImage = `url('bg-img/${blockType}.png')`

  // 如果是透明方块（如树叶），设置透明度
  if (BLOCKS[blockType]?.transparent) {
    block.style.opacity = "0.8"
  }

  worldContainer.appendChild(block)
  return block
}

function createTorch(x, y) {
  const torch = document.createElement("div")
  torch.className = "torch"
  torch.style.width = `${BLOCK_SIZE}px`
  torch.style.height = `${BLOCK_SIZE}px`
  torch.style.left = `${x * BLOCK_SIZE}px`
  torch.style.top = `${y * BLOCK_SIZE - cameraY}px`
  torch.style.zIndex = "10"
  worldContainer.appendChild(torch)

  const light = document.createElement("div")
  light.className = "torch-light"
  light.style.left = `${x * BLOCK_SIZE + BLOCK_SIZE / 2}px`
  light.style.top = `${y * BLOCK_SIZE + BLOCK_SIZE / 2 - cameraY}px`
  worldContainer.appendChild(light)
}

function createGlowLichen(x, y) {
  const lichen = document.createElement("div")
  lichen.className = "glow-lichen"
  lichen.style.width = `${BLOCK_SIZE}px`
  lichen.style.height = `${BLOCK_SIZE}px`
  lichen.style.left = `${x * BLOCK_SIZE}px`
  lichen.style.top = `${y * BLOCK_SIZE - cameraY}px`
  worldContainer.appendChild(lichen)

  const light = document.createElement("div")
  light.className = "glow-lichen-light"
  light.style.left = `${x * BLOCK_SIZE + BLOCK_SIZE / 2}px`
  light.style.top = `${y * BLOCK_SIZE + BLOCK_SIZE / 2 - cameraY}px`
  worldContainer.appendChild(light)
}

function updateDarkness() {
  const darknessOverlay = document.querySelector(".darkness-overlay")
  if (!darknessOverlay) return

  const depthFactor = Math.max(
    0,
    Math.min(0.85, ((cameraY / BLOCK_SIZE - SURFACE_LEVEL) / (WORLD_HEIGHT - SURFACE_LEVEL)) * 0.85),
  )
  darknessOverlay.style.backgroundColor = `rgba(0, 0, 0, ${depthFactor})`
}

function startMining(block) {
  if (miningBlock === block) return

  stopMining()

  miningBlock = block
  miningProgress = 0
  lastMiningTime = Date.now()

  const overlay = document.createElement("div")
  overlay.className = "mining-overlay"
  overlay.id = "mining-overlay"
  overlay.style.backgroundImage = `url('bg-img/destroy_stage_0.png')`
  miningBlock.appendChild(overlay)

  const blockType = miningBlock.dataset.type
  const hardness = BLOCKS[blockType]?.hardness || 1

  miningInterval = setInterval(() => {
    const now = Date.now()
    const deltaTime = (now - lastMiningTime) / 1000
    lastMiningTime = now

    miningProgress += deltaTime / hardness

    if (miningProgress >= 1) {
      const x = Number.parseInt(miningBlock.dataset.x)
      const y = Number.parseInt(miningBlock.dataset.y)
      worldData[y][x] = null
      miningBlock.remove()
      stopMining()
    } else {
      const stage = Math.min(9, Math.floor(miningProgress * 10))
      const overlay = document.getElementById("mining-overlay")
      if (overlay) {
        overlay.style.backgroundImage = `url('bg-img/destroy_stage_${stage}.png')`
      }
    }
  }, 100)
}

function stopMining() {
  if (miningInterval) {
    clearInterval(miningInterval)
    miningInterval = null
  }

  if (miningBlock) {
    const overlay = document.getElementById("mining-overlay")
    if (overlay) {
      overlay.remove()
    }
    miningBlock = null
  }

  miningProgress = 0
}

function placeTorch(x, y) {
  const existingTorch = torches.find((t) => t.x === x && t.y === y)
  if (existingTorch) return

  torches.push({ x, y })
  createTorch(x, y)
}

function setupEventListeners() {
  document.addEventListener("contextmenu", (e) => {
    if (isMinecraftMode) {
      e.preventDefault()
    }
  })

  worldContainer.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      const block = e.target.closest(".block:not(.background-block)")
      if (block) {
        startMining(block)
      }
    } else if (e.button === 2) {
      const block = e.target.closest(".block:not(.background-block)")
      if (block) {
        const x = Number.parseInt(block.dataset.x)
        const y = Number.parseInt(block.dataset.y)
        placeTorch(x, y)
      }
    }
  })

  document.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
      stopMining()
    }
  })

  worldContainer.addEventListener("mouseleave", () => {
    stopMining()
  })

  worldContainer.addEventListener("mousemove", (e) => {
    if (e.buttons === 1) {
      const block = e.target.closest(".block:not(.background-block)")
      if (block && block !== miningBlock) {
        startMining(block)
      }
    }
  })

  window.addEventListener("wheel", (e) => {
    if (!isMinecraftMode) return

    const scrollAmount = e.deltaY
    cameraY = Math.max(0, Math.min(WORLD_HEIGHT * BLOCK_SIZE - window.innerHeight, cameraY + scrollAmount))
    renderWorld()
  })

  window.addEventListener("resize", () => {
    if (isMinecraftMode) {
      renderWorld()
    }
  })

  setInterval(() => {
    if (miningBlock && Date.now() - lastMiningTime > 2000) {
      stopMining()
    }
  }, 500)
}

console.log("%cMSM服务器管理器", "font-size: 20px; font-weight: bold; color: #6558F5;")
console.log("%c欢迎查看我们的源代码！请随时联系我们寻求合作或报告问题。", "font-size: 12px; color: #B4B4B4;")