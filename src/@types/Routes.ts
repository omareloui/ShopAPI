import { RequestHandler } from "express";

export enum HTTPMethods {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
}

export type RequireAuthentication = boolean;

export type RoutesArray = [
  HTTPMethods,
  string,
  RequestHandler,
  RequireAuthentication?
][];
