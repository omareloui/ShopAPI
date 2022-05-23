import config from "../config";

const { isProd } = config;

export class APIError extends Error {
  public statusMessage: string;

  constructor(
    error: APIError | Error | string | unknown,
    public statusCode?: number
  ) {
    let message: string;

    if (error instanceof Error || error instanceof APIError)
      message = error.message;
    else if (typeof error === "string") message = error;
    else message = "CAN'T PARSE THE ERROR MESSAGE";

    super(message);

    if (!statusCode) {
      if (error instanceof APIError && error.statusCode)
        this.statusCode = error.statusCode;
      else if (error instanceof Error && error.name === "ValidationError")
        this.statusCode = 401;
      else if (message.match(/^can't find/i)) this.statusCode = 404;
      else this.statusCode = 500;
    }

    this.stack = isProd ? "" : this.stack;

    switch (statusCode) {
      case 304:
        this.statusMessage = "Not Modified";
        break;
      case 400:
        this.statusMessage = "Bad Request";
        break;
      case 401:
        this.statusMessage = "Unauthorized";
        break;
      case 403:
        this.statusMessage = "Forbidden";
        break;
      case 404:
        this.statusMessage = "Not Found";
        break;
      case 409:
        this.statusMessage = "Conflict";
        break;
      default:
        this.statusMessage = "Internal Server Error";
    }
  }
}
