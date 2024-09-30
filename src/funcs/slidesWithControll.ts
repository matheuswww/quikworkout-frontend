interface Dist {
 finalPosition: number;
 startX: number;
 movement: number;
 movePosition: number;
}

//the copy of function is a workaround,maybe a day i fix this bug,is a scope problem,js is a trash,or react,idk,but i hate this lang
export function slidesWithControll(
 slide: HTMLElement,
 wrapper: HTMLElement,
 thumbs: NodeListOf<ChildNode> | undefined,
 indexClass: string,
 activeIndexClass: string,
 activeThumbClass: string,
) {
 let item = 0;
 let dist: Dist = {
  finalPosition: 0,
  startX: 0,
  movement: 0,
  movePosition: 0,
 };
 let index: HTMLElement | null = null;
 slide.style.willChange = 'transform';
 let itemWidth =
  slide.children[0] instanceof HTMLElement ? slide.children[0].offsetWidth : 0;
 let middleOfItem = itemWidth / 2;
 window.addEventListener('resize', () => {
  itemWidth =
   slide.children[0] instanceof HTMLElement ? slide.children[0].offsetWidth : 0;
  middleOfItem = itemWidth / 2;
  const move = -(item * itemWidth);
  moveSlide(move);
  dist.movePosition = move;
  dist.finalPosition = move;
  thumbs &&
   thumbs.forEach((thumb) => {
    if (thumb instanceof HTMLElement) {
     thumb.addEventListener('click', onClick);
    }
   });
 });

 const onClick = function (event: Event) {
  const prevElement = thumbs && thumbs[item].firstChild;
  if (
   prevElement instanceof HTMLElement &&
   index &&
   thumbs &&
   event.target instanceof HTMLElement
  ) {
   const thumbIndex = Number(event.target.id);
   const currentElement = thumbs && thumbs[thumbIndex].firstChild;
   prevElement.classList.remove(activeThumbClass);
   if (currentElement instanceof HTMLElement) {
    currentElement.classList.add(activeThumbClass);
   }
   index.children[item].classList.remove(activeIndexClass);
   index.children[thumbIndex].classList.add(activeIndexClass);
   item = thumbIndex;
   const move = -(thumbIndex * itemWidth);
   moveSlide(move);
   dist.movePosition = move;
   dist.finalPosition = move;
  }
 };

 const onKeyDown = function (event: Event) {
  wrapper.scrollLeft = 0;
  onClick(event);
 };

 const moveSlide = function (distX: number) {
  dist.movePosition = distX;
  slide.style.transform = `translate3d(${distX}px, 0, 0)`;
 };

 const updatePosition = function (clientX: number) {
  const distX = clientX - dist.startX;
  dist.movement = distX;
  const limitLeft = 0;
  const limitRight = -(slide.offsetWidth - wrapper.offsetWidth);
  const newPosition = Math.min(
   Math.max(dist.finalPosition + distX, limitRight),
   limitLeft,
  );
  moveSlide(newPosition);
 };

 const onStart = function (event: MouseEvent | TouchEvent) {
  event.preventDefault();
  let moveType: 'mousemove' | 'touchmove';
  if (event instanceof MouseEvent) {
   dist.startX = event.clientX;
   moveType = 'mousemove';
   document.addEventListener('mouseup', onEnd);
  } else {
   dist.startX = event.changedTouches[0].clientX;
   document.addEventListener('touchend', onEnd);
   moveType = 'touchmove';
  }
  wrapper.addEventListener(moveType, onMove);
 };

 const onMove = function (event: MouseEvent | TouchEvent) {
  if (event instanceof MouseEvent) {
   updatePosition(event.clientX);
  } else {
   updatePosition(event.changedTouches[0].clientX);
  }
  if (Math.abs(dist.movement) >= itemWidth) {
   if (event instanceof MouseEvent) {
    const mouseUp = new MouseEvent('mouseup', {
     bubbles: false,
     cancelable: false,
     view: window,
    });
    document.dispatchEvent(mouseUp);
   } else {
    const touchEnd = new TouchEvent('touchend', {
     bubbles: false,
     cancelable: false,
     view: window,
    });
    document.dispatchEvent(touchEnd);
   }
  }
 };

 const moveSlideOnEnd = function (distX: number) {
  slide.style.transition = '.5s';
  wrapper.style.pointerEvents = 'none';
  moveSlide(distX);
  setTimeout(() => {
   slide.style.transition = 'none';
   wrapper.style.pointerEvents = 'initial';
  }, 500);
 };

 const onEnd = function (event: MouseEvent | TouchEvent) {
  let moveType: 'mousemove' | 'touchmove';
  if (event instanceof MouseEvent) {
   moveType = 'mousemove';
  } else {
   moveType = 'touchmove';
  }
  const prevElement = thumbs && thumbs[item];
  if (dist.movePosition != dist.finalPosition) {
   if (
    (Math.abs(dist.finalPosition) + dist.movement <
     Math.abs(dist.finalPosition) &&
     Math.abs(dist.movement) > 5) ||
    (Math.abs(dist.movePosition) < middleOfItem &&
     Math.abs(dist.finalPosition) + dist.movement <
      Math.abs(dist.finalPosition) &&
     Math.abs(dist.movement) > 5)
   ) {
    if (item >= slide.children.length - 1) {
     moveSlideOnEnd(dist.finalPosition);
    } else {
     moveSlideOnEnd(dist.finalPosition - itemWidth);
     item = item + 1;
     if (index instanceof HTMLElement) {
      if (index.children[item - 1]) {
       index.children[item - 1].classList.remove(activeIndexClass);
      }
      index.children[item].classList.add(activeIndexClass);
     }
    }
   } else if (Math.abs(dist.movement) < 5) {
    moveSlideOnEnd(dist.finalPosition);
   } else {
    moveSlideOnEnd(dist.finalPosition + itemWidth);
    item = item - 1;
    if (index instanceof HTMLElement) {
     if (index.children[item + 1]) {
      index.children[item + 1].classList.remove(activeIndexClass);
     }
     index.children[item].classList.add(activeIndexClass);
    }
   }
  }
  if (thumbs && prevElement?.firstChild instanceof HTMLElement) {
   const currentThumbElement = thumbs && thumbs[item];
   prevElement.firstChild.classList.remove(activeThumbClass);
   currentThumbElement.firstChild instanceof HTMLElement &&
    currentThumbElement.firstChild.classList.add(activeThumbClass);
  }
  document.removeEventListener('mouseup', onEnd);
  document.removeEventListener('touchend', onEnd);
  wrapper.removeEventListener(moveType, onMove);
  dist.finalPosition = dist.movePosition;
 };

 const createSlideIndex = function () {
  if (slide.children.length >= 2) {
   index = document.createElement('div');
   index.classList.add(indexClass);
   for (let i = 0; i < slide.children.length; i++) {
    const span = document.createElement('span');
    index.appendChild(span);
   }
   index.firstChild instanceof HTMLElement &&
    index.firstChild.classList.add(activeIndexClass);
   wrapper.appendChild(index);
  }
 };

 const addSlideEvents = function () {
  wrapper.addEventListener('mousedown', onStart);
  wrapper.addEventListener('touchstart', onStart);
  thumbs &&
   thumbs.forEach((thumb) => {
    if (thumb instanceof HTMLElement) {
     thumb.addEventListener('click', onClick);
    }
   });
  slide.childNodes.forEach((li) => {
   if (li instanceof HTMLLIElement) {
    if (li.firstChild instanceof HTMLImageElement) {
     li.firstChild.addEventListener('focus', onKeyDown);
    }
   }
  });
 };

 (function init() {
  item = 0;
  dist = { finalPosition: 0, startX: 0, movement: 0, movePosition: 0 };
  index = null;
  slide.style.transform = `translate3d(0px,0,0)`;
  createSlideIndex();
  addSlideEvents();
  setTimeout(() => {
   itemWidth =
    slide.children[0] instanceof HTMLElement
     ? slide.children[0].offsetWidth
     : 0;
  }, 50);
 })();
}
