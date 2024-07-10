export default function handleModalClick(modalRef:React.MutableRefObject<HTMLElement | null>, buttonRef:React.MutableRefObject<HTMLButtonElement | null>, closeRef: React.MutableRefObject<HTMLButtonElement | null>, active: string, display: string) {
  const main = document.body.querySelector("main")
  let section = main instanceof HTMLElement && main.lastChild
  console.log("jlsdjfldks");
  
  if (section instanceof HTMLElement && buttonRef.current instanceof HTMLElement && modalRef.current instanceof HTMLElement) {
    section.style.opacity = ".1"
    modalRef.current.style.display = display
    setTimeout(() => {  
      modalRef.current instanceof HTMLElement && modalRef.current.classList.add(active)
    });
    modalRef.current.focus()
    modalRef.current.tabIndex = 0
    buttonRef.current.style.pointerEvents = "none"
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
      if(modalRef.current instanceof HTMLElement && buttonRef.current instanceof HTMLElement) {          
        buttonRef.current.style.pointerEvents = "initial"
        modalRef.current.style.display = "none"
      }
     }, 500)
    if(section instanceof HTMLElement) {
      section.style.opacity = "1"
    }
    document.removeEventListener("click", handleCloseModal)
  }
}