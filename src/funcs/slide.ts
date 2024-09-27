interface dist {
 finalPosition: number;
 startX: number;
 movement: number;
 movePosition: number;
}

export default class slide {
 slide;
 wrapper;
 dist: dist;
 constructor(slide: HTMLElement, wrapper: HTMLElement) {
  this.slide = slide;
  this.wrapper = wrapper;
  this.dist = { finalPosition: 0, startX: 0, movement: 0, movePosition: 0 };
  this.slide.style.willChange = "transform"
  window.addEventListener("resize", () => {
    this.updatePosition(this.slide.offsetWidth)
    this.dist = {
      finalPosition: 0,
      movement: 0,
      movePosition: 0,
      startX: 0,
    }
  })
  this.init();
 }

 moveSlide(distX: number) {
  this.dist.movePosition = distX;
  this.slide.style.transform = `translate3d(${distX}px,0,0)`;
 }

 updatePosition(clientX: number) {
  const distX = (clientX - this.dist.startX) * 1.5;  
  this.dist.movement = distX;
  const limitLeft = 0;
  const limitRight = -(this.slide.offsetWidth - this.wrapper.offsetWidth);
  const newPosition = Math.min(
   Math.max(this.dist.finalPosition + distX, limitRight),
   limitLeft,
  );

  this.moveSlide(newPosition);
 }

 onStart(event: MouseEvent | TouchEvent) {  
   let moveType: 'mousemove' | 'touchmove';
   if (event instanceof MouseEvent) {
   event.preventDefault();
   this.dist.startX = event.clientX;
   moveType = 'mousemove';
  } else {
   this.dist.startX = event.changedTouches[0].clientX;
   moveType = 'touchmove';
  }
  this.wrapper.addEventListener(moveType, this.onMove);
 }

 onMove(event: MouseEvent | TouchEvent) {
  event.preventDefault()
  if (event instanceof MouseEvent) {
   this.updatePosition(event.clientX);
  } else {
   this.updatePosition(event.changedTouches[0].clientX);
   this.dist.movement = 0
  }
 }

 onEnd(event: MouseEvent | TouchEvent) {
  let moveType: 'mousemove' | 'touchmove';
  if (event instanceof MouseEvent) {
   moveType = 'mousemove';
  } else {
    moveType = 'touchmove';
  }
  this.wrapper.removeEventListener(moveType, this.onMove)
  this.dist.finalPosition = this.dist.movePosition;
  if (Math.abs(this.dist.movement) > 0) {
    this.wrapper.addEventListener('click', this.preventClick)
   }
  }
  
  preventClick(event: MouseEvent) {
  event.preventDefault()
  this.dist.movement = 0
  this.wrapper.removeEventListener('click', this.preventClick)
 }

 addSlideEvents() {
  this.wrapper.addEventListener('mousedown', this.onStart);
  document.addEventListener('mouseup', this.onEnd);
  this.wrapper.addEventListener('touchstart', this.onStart);
  document.addEventListener('touchend', this.onEnd);
 }

 bindEvents() {
  this.onStart = this.onStart.bind(this);
  this.onMove = this.onMove.bind(this);
  this.onEnd = this.onEnd.bind(this);
  this.preventClick = this.preventClick.bind(this);
 }

 init() {
  this.bindEvents();
  this.addSlideEvents();
  return this;
 }
}
