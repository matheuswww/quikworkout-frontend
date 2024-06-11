export function ValidateCpf(cpf: string): boolean {
  if (cpf.length !== 11) {
      return false
  }
  let checkFirstDigit = 0
  let checkSecondDigit = 0
  let nums1 = 10
  let nums2 = 11
  let diferent = false
  let prevDigit = null
  for (let i = 0; i < cpf.length; i++) {
      const num = parseInt(cpf.charAt(i))
      if (isNaN(num)) {
          return false
      }
      if (prevDigit !== null && prevDigit !== num) {
          diferent = true
      }
      prevDigit = num

      if (i <= 8) {
          checkFirstDigit += num * nums1
          nums1 -= 1
      }
      if (i <= 9) {
          checkSecondDigit += num * nums2
          nums2 -= 1
      }
  }
  if (!diferent) {
      return false
  }
  let res = (checkFirstDigit * 10) % 11
  const firstDigit = parseInt(cpf.charAt(9))
  if (res === 10) {
      res = 0
  }
  if (res !== firstDigit) {
      return false
  }
  const secondDigit = parseInt(cpf.charAt(10))
  res = (checkSecondDigit * 10) % 11
  if (res === 10) {
      res = 0
  }
  return res === secondDigit
}

export function ValidateCnpj(cnpj: string): boolean {
  if (cnpj.length !== 14) {
    return false
  }
  let checkFirstDigit = 0
  let checkSecondDigit = 0
  const nums1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const nums2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let diferent = false
  let prevDigit = null
  for (let i = 0; i < cnpj.length; i++) {
      const num = parseInt(cnpj.charAt(i))
      if (isNaN(num)) {
          return false
      }
      if (prevDigit !== null && prevDigit !== num) {
          diferent = true
      }
      prevDigit = num

      if (i <= 11) {
          checkFirstDigit += num * nums1[i]
      }
      if (i <= 12) {
          checkSecondDigit += num * nums2[i]
      }
  }
  if (!diferent) {
      return false
  }
  let res = checkFirstDigit % 11
  const firstDigit = parseInt(cnpj.charAt(12))
  if (res === 0 || res === 1) {
      res = 0
  }
  if (res === 2 || res === 3 || res === 4 || res === 5 || res === 6 || res === 7 || res === 8 || res === 9 || res === 10) {
      res = 11 - res
  }
  if (res !== firstDigit) {
      return false
  }
  res = checkSecondDigit % 11
  const secondDigit = parseInt(cnpj.charAt(13))
  if (res === 0 || res === 1) {
      res = 0
  }
  if (res === 2 || res === 3 || res === 4 || res === 5 || res === 6 || res === 7 || res === 8 || res === 9 || res === 10) {
      res = 11 - res
  }
  return res === secondDigit
}
