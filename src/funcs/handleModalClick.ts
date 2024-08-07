export default function handleModalClick(modalRef:React.MutableRefObject<HTMLElement | null>, buttonRef:React.MutableRefObject<HTMLButtonElement | null> | HTMLButtonElement, closeRef: React.MutableRefObject<HTMLButtonElement | null>, active: string, display: string) {
  let button: HTMLButtonElement | null = null
  if('current' in buttonRef) {
    if(buttonRef.current instanceof HTMLButtonElement) {
      button = buttonRef.current
    }
  } else if(buttonRef instanceof HTMLButtonElement) {
    button = buttonRef
  }
  const main = document.body.querySelector("main")
  let section = main instanceof HTMLElement && main.lastChild
  if (section instanceof HTMLElement && button instanceof HTMLElement && modalRef.current instanceof HTMLElement) {
    section.style.opacity = ".1"
    modalRef.current.style.display = display
    setTimeout(() => {  
      modalRef.current instanceof HTMLElement && modalRef.current.classList.add(active)
    });
    modalRef.current.focus()
    modalRef.current.tabIndex = 0
    button.style.pointerEvents = "none"
  }
  document.addEventListener("click", handleCloseModal)
  function handleCloseModal(event: Event) {
    if(event.target instanceof HTMLElement && modalRef.current?.contains(event.target) && !closeRef.current?.contains(event.target)) {      
      return
    }
    if (modalRef.current instanceof HTMLElement && modalRef.current instanceof HTMLElement) {
      modalRef.current.focus()
      modalRef.current.classList.remove(active)
    }
    setTimeout(() => {
      if(modalRef.current instanceof HTMLElement && button instanceof HTMLElement) {          
        button.style.pointerEvents = "initial"
        modalRef.current.style.display = "none"
      }
     }, 500)
    if(section instanceof HTMLElement) {
      section.style.opacity = "1"
    }
    document.removeEventListener("click", handleCloseModal)
  }
}