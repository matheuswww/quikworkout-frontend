export default function handleModalColorClick(buttonToOpenModalRef:React.MutableRefObject<HTMLButtonElement | null>, modalRef:React.MutableRefObject<HTMLElement | null>, active: string, callbackOnEnter?: Function, callbackOnOut?: Function) {
  const main = document.body.querySelector("main")
  let section = main instanceof HTMLElement && main.lastChild
  if (section instanceof HTMLElement && modalRef.current instanceof HTMLElement && buttonToOpenModalRef.current instanceof HTMLElement) {
    callbackOnEnter && callbackOnEnter()
    section.style.opacity = ".1"
    modalRef.current.style.display = "flex"
    setTimeout(() => {  
      modalRef.current instanceof HTMLElement && modalRef.current.classList.add(active)
    });
    modalRef.current.focus()
    modalRef.current.tabIndex = 0
    buttonToOpenModalRef.current.style.pointerEvents = "none"
  }
  document.addEventListener("click", handleCloseModal)
  function handleCloseModal() {
    callbackOnOut && callbackOnOut()
    if (modalRef.current instanceof HTMLElement && buttonToOpenModalRef.current instanceof HTMLElement) {
      buttonToOpenModalRef.current.focus()
      modalRef.current.classList.remove(active)
    }
    setTimeout(() => {
      if(buttonToOpenModalRef.current instanceof HTMLElement && modalRef.current instanceof HTMLElement) {          
        buttonToOpenModalRef.current.style.pointerEvents = "initial"
        modalRef.current.style.display = "none"
      }
     }, 500)
    if(section instanceof HTMLElement) {
      section.style.opacity = "1"
    }
    document.removeEventListener("click", handleCloseModal)
  }
}