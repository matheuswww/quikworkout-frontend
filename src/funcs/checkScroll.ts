export function checkScroll(): boolean {
  const scrollPosition = window.scrollY + window.innerHeight;
  const pageHeight = document.documentElement.scrollHeight;
  return scrollPosition >= pageHeight - 100
}