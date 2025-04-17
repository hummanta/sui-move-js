import './style.css'
import { startCounterTask } from './counter-compiler'
import { startDisassembleTask } from './disassembler'

const app = document.querySelector<HTMLDivElement>('#app')!

class PlaygroundApp {
  private container: HTMLDivElement
  private sidebar: HTMLDivElement
  private mainContent: HTMLDivElement
  private activeModule: string = 'counter'

  constructor() {
    this.container = document.createElement('div')
    this.container.className = 'container'
    app.appendChild(this.container)

    this.sidebar = this.createSidebar()
    this.mainContent = this.createMainContent()
    this.container.appendChild(this.sidebar)
    this.container.appendChild(this.mainContent)

    this.initializeDefaultModule()
  }

  private createSidebar(): HTMLDivElement {
    const sidebar = document.createElement('div')
    sidebar.className = 'sidebar'

    const header = document.createElement('div')
    header.className = 'sidebar-header'
    header.innerHTML = '<h1>Sui Playground</h1>'
    sidebar.appendChild(header)

    const navItems = document.createElement('div')
    navItems.className = 'nav-items'

    const modules = [
      { id: 'counter', name: 'Counter Compiler' },
      { id: 'disassemble', name: 'Disassembler' }
    ]

    modules.forEach(module => {
      const navItem = document.createElement('div')
      navItem.className = `nav-item ${module.id === this.activeModule ? 'active' : ''}`
      navItem.innerHTML = `<span>${module.name}</span>`
      navItem.addEventListener('click', () => this.switchModule(module.id))
      navItems.appendChild(navItem)
    })

    sidebar.appendChild(navItems)
    return sidebar
  }

  private createMainContent(): HTMLDivElement {
    const mainContent = document.createElement('div')
    mainContent.className = 'main-content'
    return mainContent
  }

  private async switchModule(moduleId: string) {
    if (moduleId === this.activeModule) return

    // Update navigation state
    const navItems = this.sidebar.querySelectorAll('.nav-item')
    navItems.forEach(item => item.classList.remove('active'))
    this.sidebar.querySelector(`.nav-item:nth-child(${moduleId === 'counter' ? 1 : 2})`)?.classList.add('active')

    // Clear main content
    this.mainContent.innerHTML = ''

    // Create new content container
    const contentContainer = document.createElement('div')
    contentContainer.className = 'content-section active'
    contentContainer.id = `${moduleId}-content`
    this.mainContent.appendChild(contentContainer)

    // Load module content
    if (moduleId === 'counter') {
      await startCounterTask()
    } else {
      await startDisassembleTask()
    }

    this.activeModule = moduleId
  }

  private initializeDefaultModule() {
    const contentContainer = document.createElement('div')
    contentContainer.className = 'content-section active'
    contentContainer.id = 'counter-content'
    this.mainContent.appendChild(contentContainer)
    startCounterTask()
  }
}

// Initialize the application
new PlaygroundApp()