const stylesheet = new CSSStyleSheet()
stylesheet.replaceSync(`

`)

/**
 * An example Custom Element. This documentation ends up in the
 * README so describe how this elements works here.
 *
 * You can event add examples on the element is used with Markdown.
 *
 * ```
 * <tomato-timer></tomato-timer>
 * ```
 */
class TomatoTimerElement extends HTMLElement {
  #timer = 0
  #renderRoot!: ShadowRoot
  #notification: Notification | null
  #timeoutId = 0

  #mode = 'tick'
  get mode() {
    return this.#mode
  }

  set mode(value: 'tick' | 'tock') {
    this.#mode = value
  }

  get tickSeconds() {
    return 60
  }

  get tockSeconds() {
    return 30
  }

  get #display() {
    return this.#renderRoot.querySelector('div')!
  }

  connectedCallback(): void {
    this.#renderRoot = this.attachShadow({mode:'open'})
    this.#renderRoot.adoptedStyleSheets = [stylesheet]
    this.#renderRoot.innerHTML = `<div></div><button>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
    </button>`
    this.start(this.tickSeconds)
    this.addEventListener('click', this)
  }

  handleEvent(event: Event) {
    clearTimeout(this.#timeoutId)
  }

  start(time: number) {
    this.#timer = Date.now() + time * 1000
    this.#update()
    Notification.requestPermission()
  }

  #update() {
    const remaining = this.#timer - Date.now()
    const seconds = Math.round(remaining / 1000)
    if (seconds < 0) {
      return this.end()
    }
    this.#timeoutId = setTimeout(() => this.#update(), 1000)
    const minutes = Math.floor(seconds / 60)
    const minutesDisplay = String(minutes % 60).padStart(2, '0')
    const secondDisplay = String(seconds % 60).padStart(2, '0')
    this.#display.textContent = `${minutesDisplay}:${secondDisplay}`
  }

  end() {
    if (this.mode === 'tick') {
      const notification = new Notification('Time for break!')
      setTimeout(() => notification.close(), 4000)
      this.mode = 'tock'
      this.start(this.tockSeconds)
    } else if (this.mode === 'tock') {
      const notification = new Notification('Back to work!')
      setTimeout(() => notification.close(), 4000)
      this.mode = 'tick'
      this.start(this.tickSeconds)
    }
  }
}

declare global {
  interface Window {
    TomatoTimerElement: typeof TomatoTimerElement
  }
}

export default TomatoTimerElement

if (!window.customElements.get('tomato-timer')) {
  window.TomatoTimerElement = TomatoTimerElement
  window.customElements.define('tomato-timer', TomatoTimerElement)
}
