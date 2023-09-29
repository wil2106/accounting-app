import axios from "axios";
import { DEFAULT_ERROR_MESSAGE, HANDLED_ERROR_STATUS_CODES } from "./constants";

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
};

export default utils;
