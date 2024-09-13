// Função para validar um email
export function ValidateEmail(email: string): boolean {
  const regex = /^[\w\d.-]+@([\w-]+\.)+[\w-]{2,4}$/
  return regex.test(email)
}