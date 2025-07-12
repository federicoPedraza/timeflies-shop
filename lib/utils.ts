import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Price formatting utilities
export function formatPrice(price: number): string {
  // If price is zero, return "Price on request"
  if (price === 0) {
    return "Price on request"
  }

  // Convert to string and split by decimal point
  const [wholePart, decimalPart] = price.toFixed(2).split('.')

  // Add dots for thousands separators
  const formattedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  // Return with comma for decimal separator
  return `${formattedWhole},${decimalPart}`
}

// Convert number to words (English)
export function numberToWords(num: number): string {
  const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
  const hundreds = ['', 'one hundred', 'two hundred', 'three hundred', 'four hundred', 'five hundred', 'six hundred', 'seven hundred', 'eight hundred', 'nine hundred']

  if (num === 0) return 'zero'
  if (num < 0) return 'minus ' + numberToWords(Math.abs(num))

  // Handle decimals
  const [whole, decimal] = num.toFixed(2).split('.')
  const wholeNum = parseInt(whole)
  const decimalNum = parseInt(decimal)

  let result = ''

  // Handle whole part
  if (wholeNum === 0) {
    result = 'zero'
  } else if (wholeNum < 10) {
    result = units[wholeNum]
  } else if (wholeNum < 20) {
    result = teens[wholeNum - 10]
  } else if (wholeNum < 100) {
    if (wholeNum % 10 === 0) {
      result = tens[Math.floor(wholeNum / 10)]
    } else {
      result = tens[Math.floor(wholeNum / 10)] + '-' + units[wholeNum % 10]
    }
  } else if (wholeNum < 1000) {
    if (wholeNum === 100) {
      result = 'one hundred'
    } else {
      result = hundreds[Math.floor(wholeNum / 100)]
      const remainder = wholeNum % 100
      if (remainder > 0) {
        result += ' ' + numberToWords(remainder)
      }
    }
  } else if (wholeNum < 1000000) {
    const thousands = Math.floor(wholeNum / 1000)
    const remainder = wholeNum % 1000

    if (thousands === 1) {
      result = 'one thousand'
    } else {
      result = numberToWords(thousands) + ' thousand'
    }

    if (remainder > 0) {
      if (remainder < 100) {
        result += ' ' + numberToWords(remainder)
      } else {
        result += ' ' + numberToWords(remainder)
      }
    }
  } else if (wholeNum < 1000000000) {
    const millions = Math.floor(wholeNum / 1000000)
    const remainder = wholeNum % 1000000

    if (millions === 1) {
      result = 'one million'
    } else {
      result = numberToWords(millions) + ' million'
    }

    if (remainder > 0) {
      result += ' ' + numberToWords(remainder)
    }
  }

  // Handle decimal part
  if (decimalNum > 0) {
    result += ' and ' + numberToWords(decimalNum) + ' cents'
  }

  return result
}
