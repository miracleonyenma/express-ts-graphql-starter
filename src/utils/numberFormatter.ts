// ./src/utils/numberFormatter.ts

import { logger } from "@untools/logger";
import { getParamByParam } from "iso-country-currency";

interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  display?: "code" | "symbol" | "both";
  symbolFirst?: boolean;
}

export function formatCurrency(
  value: number | undefined | null,
  options: FormatCurrencyOptions = {}
): string {
  const {
    currency = "USD",
    locale = "en-US",
    minimumFractionDigits = 2,
    maximumFractionDigits = 5,
    display = "symbol",
    symbolFirst = true,
  } = options;

  try {
    // Format the number first
    const formattedNumber = new Intl.NumberFormat(locale, {
      style: "decimal",
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value || 0);

    // Get symbol if needed
    let symbol = "";
    if (display === "symbol" || display === "both") {
      try {
        const foundSymbol = getParamByParam("currency", currency, "symbol");
        if (foundSymbol) {
          symbol = foundSymbol;
        }
      } catch {
        // If symbol lookup fails, fall back to code-only display
        return `${currency} ${formattedNumber}`;
      }
    }

    // Return formatted string based on display option
    switch (display) {
      case "symbol":
        return symbol
          ? `${symbol}${formattedNumber}`
          : `${currency} ${formattedNumber}`;
      case "both":
        if (symbol) {
          return symbolFirst
            ? `${symbol} ${formattedNumber} (${currency})`
            : `${currency} ${formattedNumber} (${symbol})`;
        }
        return `${currency} ${formattedNumber}`;
      case "code":
      default:
        return `${currency} ${formattedNumber}`;
    }
  } catch (error) {
    logger.error("🚫 Something went wrong while formatting currency:", error);
    // Ultimate fallback
    return `${currency} ${(value || 0).toFixed(minimumFractionDigits)}`;
  }
}

export function formatNumber(
  value: number | undefined | null,
  options: FormatCurrencyOptions = {
    locale: "en-US",
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  }
): string {
  try {
    // Format the number first
    const formattedNumber = new Intl.NumberFormat(options.locale, {
      style: "decimal",
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits,
    }).format(value || 0);

    return formattedNumber;
  } catch (error) {
    logger.error("🚫 Something went wrong while formatting number:", error);
    // Ultimate fallback
    return (value || 0).toFixed(options.minimumFractionDigits);
  }
}

export interface FormatOptions {
  mask?: boolean;
  maskChar?: string;
  maskCount?: number;
  spacing?: number;
  separator?: string;
  customPattern?: string | null;
}

export function formatCardNumber(
  input: string | number,
  options: FormatOptions = {}
): string {
  const {
    mask = false,
    maskChar = "*",
    maskCount = 12,
    spacing = 4,
    separator = " ",
    customPattern = null,
  } = options;

  // Convert input to string and remove any existing separators
  const cleanInput = String(input).replace(/\D/g, "");

  // Handle masking (for card numbers)
  if (mask) {
    let masked: string;

    if (cleanInput.length <= 4) {
      // For short inputs (like "3456"), create full card format with masking
      masked = maskChar.repeat(maskCount) + cleanInput.padStart(4, "0");
    } else {
      // For longer inputs, take last 4 digits and mask the rest
      const lastFour = cleanInput.slice(-4);
      masked = maskChar.repeat(maskCount) + lastFour;
    }

    // Apply formatting to masked string
    return applyFormatting(masked, spacing, separator, customPattern);
  }

  // Apply formatting to original input
  return applyFormatting(cleanInput, spacing, separator, customPattern);
}

function applyFormatting(
  str: string,
  spacing: number,
  separator: string,
  customPattern: string | null
): string {
  if (customPattern) {
    // Custom pattern formatting (e.g., "XXXX-XXXX-XXXX-XXXX")
    let result = "";
    let strIndex = 0;

    for (let i = 0; i < customPattern.length && strIndex < str.length; i++) {
      if (customPattern[i] === "X") {
        result += str[strIndex++];
      } else {
        result += customPattern[i];
      }
    }

    // Add remaining digits if any
    if (strIndex < str.length) {
      result += str.slice(strIndex);
    }

    return result;
  }

  // Default spacing formatting
  return str
    .replace(new RegExp(`(.{${spacing}})`, "g"), `$1${separator}`)
    .trim();
}

// // Usage examples:

// // Basic masking (12 asterisks + last 4 digits)
// console.log(formatCardNumber("1234567890123456", { mask: true }));
// // Output: "**** **** **** 3456"

// // Custom mask character and count
// console.log(
//   formatCardNumber("1234567890123456", {
//     mask: true,
//     maskChar: "#",
//     maskCount: 8,
//   }),
// );
// // Output: "#### #### 3456"

// // Format without masking (default: space every 4 digits)
// console.log(formatCardNumber("1234567890123456"));
// // Output: "1234 5678 9012 3456"

// // Custom spacing
// console.log(formatCardNumber("123456789", { spacing: 3, separator: "-" }));
// // Output: "123-456-789"

// // Custom pattern
// console.log(
//   formatCardNumber("1234567890123456", {
//     customPattern: "XXXX-XXXX-XXXX-XXXX",
//   }),
// );
// // Output: "1234-5678-9012-3456"

// // Masked with custom pattern
// console.log(
//   formatCardNumber("1234567890123456", {
//     mask: true,
//     customPattern: "XXXX-XXXX-XXXX-XXXX",
//   }),
// );
// // Output: "****-****-****-3456"
