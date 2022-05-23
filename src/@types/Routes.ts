import { RequestHandler } from "express";

export enum HTTPMethods {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
}

export type RoutesArray = [HTTPMethods, string, RequestHandler][];
