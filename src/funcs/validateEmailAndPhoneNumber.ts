// Função para validar um email
export function ValidateEmail(email: string): boolean {
  const regex = /^[\w\d.-]+@([\w-]+\.)+[\w-]{2,4}$/
  return regex.test(email)
}

export function ValidatePhoneNumber(phoneNumber: string): boolean {
  let possibleNumber = phoneNumber
  let regex = /[+\-]/g
  if (possibleNumber.startsWith("+55")) {
    possibleNumber = possibleNumber.slice(3)
  }
  if (possibleNumber.startsWith("55")) {
    possibleNumber = possibleNumber.slice(2)
  }
  if (possibleNumber.match(regex) !== null) {
    possibleNumber = possibleNumber.replace(regex, '')
  }
  const num = Number(possibleNumber)
  if (!isNaN(num)) {
    phoneNumber = num.toString()
    if (phoneNumber.length >= 8) {
      regex = /^[1-9]{2}[0-9]{9}$/
      return regex.test(phoneNumber)
    }
    return false
  }
  return false
}