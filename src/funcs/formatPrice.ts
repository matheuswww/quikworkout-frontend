export default function formatPrice(price:number):string {
  let numberAfterQuote = price.toString().split(".")[1]
  let priceString = price.toString()
  if(numberAfterQuote == "" || !priceString.includes(".")) {
    return priceString += ",00"
  }
  if(numberAfterQuote) {
    priceString = priceString.replace(".", ",")
    if(numberAfterQuote.length === 1) {
      return priceString+="0"
    }
    if(numberAfterQuote.length === 2) {
      return priceString
    }
  }
  return price.toString().replace(".", ",")
}