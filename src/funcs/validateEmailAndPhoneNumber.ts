export default function ValidateEmailAndPhoneNumber(emailOrPhoneNumber: string): boolean {
  let possibleNumber = emailOrPhoneNumber
  let regex = /[+\-]/g;
  if(possibleNumber.startsWith("+55")) {
    possibleNumber = possibleNumber.slice(3)
  }
  if(possibleNumber.match(regex) != null) {
    possibleNumber = possibleNumber.replace(regex, '')
  }
  const num = Number(possibleNumber)
  if(!isNaN(num)) {
    emailOrPhoneNumber = num.toString()
    if(emailOrPhoneNumber.length >= 8) {
      regex = /^[1-9]{2}[0-9]{9}$/;
      return regex.test(emailOrPhoneNumber)
    }
    return false
  }
  regex = /^[\w\d.-]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(emailOrPhoneNumber)
}