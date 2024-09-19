export default function handleArrowClick(
 index: number,
 type: string,
 displayNone: string,
) {
 const arrowUp = document.querySelector('#arrowUp_' + type + '_' + index);
 const arrowDown = document.querySelector('#arrowDown_' + type + '_' + index);
 const item = document.querySelector('#item_' + type + '_' + index);
 if (arrowDown instanceof HTMLElement && arrowUp instanceof HTMLElement) {
  if (arrowDown.classList.contains(displayNone)) {
   arrowDown.classList.remove(displayNone);
   if (item instanceof HTMLElement) {
    item.classList.add(displayNone);
   }
  } else {
   arrowDown.classList.add(displayNone);
   if (item instanceof HTMLElement) {
    item.classList.remove(displayNone);
   }
  }
  if (arrowUp.classList.contains(displayNone)) {
   arrowUp.classList.remove(displayNone);
   if (item instanceof HTMLElement) {
    item.classList.add(displayNone);
   }
  } else {
   arrowUp.classList.add(displayNone);
   if (item instanceof HTMLElement) {
    item.classList.remove(displayNone);
   }
  }
 }
}
