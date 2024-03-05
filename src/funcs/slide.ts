interface dist {
  finalPosition: number
  startX: number
  movement: number
  movePosition: number
}

export default class slide {
  slide
  wrapper
  dist: dist
  constructor(slide: HTMLElement, wrapper: HTMLElement) {
    this.slide = slide
    this.wrapper = wrapper
    this.dist = { finalPosition: 0, startX: 0, movement: 0, movePosition: 0 }
    window.onresize = () => this.updatePosition(0)
    this.init()
  }

  moveSlide(distX: number) {
    this.dist.movePosition = distX
    this.slide.style.transform = `translate3d(${distX}px,0,0)`
  }

  updatePosition(clientX: number) {
    const distX = (clientX - this.dist.startX) * 1.5
    this.dist.movement = distX
    const limitLeft = 0
    const limitRight = -(this.slide.offsetWidth - this.wrapper.offsetWidth)
    const newPosition = Math.min(
      Math.max(this.dist.finalPosition + distX, limitRight),
      limitLeft
    )

    this.moveSlide(newPosition)
  }

  onStart(event: MouseEvent | TouchEvent) {
    let moveType: 'mousemove' | 'touchmove'
    if (event instanceof MouseEvent) {
      event.preventDefault()
      this.dist.startX = event.clientX
      this.wrapper.addEventListener('mousemove', this.onMove)
      moveType = 'mousemove'
    } else {
      this.dist.startX = event.changedTouches[0].clientX
      moveType = 'touchmove'
    }
    this.wrapper.addEventListener(moveType, this.onMove)
  }

  onMove(event: MouseEvent | TouchEvent) {
    if (event instanceof MouseEvent) {
      this.updatePosition(event.clientX)
    } else {
      this.updatePosition(event.changedTouches[0].clientX)
    }
  }

  onEnd(event: MouseEvent | TouchEvent) {
    let moveType: 'mousemove' | 'touchmove'
    if (event instanceof MouseEvent) {
      moveType = 'mousemove'
    } else {
      moveType = 'touchmove'
    }
    this.wrapper.removeEventListener(moveType, this.onMove)
    this.dist.finalPosition = this.dist.movePosition
  }

  addSlideEvents() {
    this.wrapper.addEventListener('mousedown', this.onStart)
    document.addEventListener('mouseup', this.onEnd, { passive: true })
    this.wrapper.addEventListener('touchstart', this.onStart, { passive: true })
    document.addEventListener('touchend', this.onEnd, { passive: true })
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this)
    this.onMove = this.onMove.bind(this)
    this.onEnd = this.onEnd.bind(this)
  }

  init() {
    this.bindEvents()
    this.addSlideEvents()
    return this
  }
}
