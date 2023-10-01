import axios from "axios";
import { DEFAULT_ERROR_MESSAGE, HANDLED_ERROR_STATUS_CODES } from "./constants";
import { format, getYear, isValid, parseISO } from "date-fns";

const utils = {
  getErrorMessage: (error: any): string => {
    let message = DEFAULT_ERROR_MESSAGE;
    if (axios.isAxiosError(error)) {
      console.log(error.response?.data);
      if (
        error.response?.status &&
        error.response?.data?.reason &&
        HANDLED_ERROR_STATUS_CODES.includes(error.response.status)
      ) {
        message = error.response.data.reason;
      }
    } else {
      console.error(error.message);
    }
    return message;
  },
  getMonthYearStringFromDateString: (dateStr: string): string => {
    const date = parseISO(dateStr);
    const isValidDate = isValid(date);
    if (!isValidDate) {
      return "Invalid date";
    }
    const month = format(date, "LLLL");
    const year = getYear(date);
    return `${month} ${year}`;
  },
  formatAmount: (amount?: number, absolute?: boolean): string => {
    if (amount === undefined) {
      return "--- €";
    }
    return absolute
      ? `${Math.abs(amount / 100)}€`
      : `${amount > 0 ? "+" : ""}${amount / 100}€`;
  },
};

export default utils;
