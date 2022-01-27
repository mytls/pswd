import { Request, Response } from "express";
import { RedisClientType, RedisModules, RedisScripts } from "redis";

declare module "express" {
  export interface Response {
    client: any;
  }
}

export type TTokenErrors = "UNDEFINED_TOKEN";

export type IBlacklistTokenErrors = "BLOCKED_TOKEN" | TTokenErrors;

export type IJwtTokenErrors =
  | TTokenErrorss
  | "JWT_EXPIRED"
  | "INVALID_SIGNATURE"
  | "INVALID_TOKEN";

export interface IBlacklistCallbackParams<
  T extends IBlacklistTokenErrors | IJwtTokenErrors
> {
  err: { type: T; details?: object; [key: string]: string } | null;
  req: Request;
  res: Response;
  data?: any;
}
export interface IAuthConfig {
  token_key: string;
}

export interface IAuthCallback<T> {
  ({ err, req, res, data }: IBlacklistCallbackParams<T>): any;
}

export type TRedisClientType = RedisClientType<RedisModules, RedisScripts>;

export namespace NBlacklist {
  export interface IBlacklistConfigs {
    redisClient: TRedisClientType;
  }

  export type IBlacklistPromiseConfigs<T extends object> = {
    [B in keyof IBlacklistConfigs]: Promise<IBlacklistConfigs[B]>;
  } & {
    [A in keyof T]: T[A];
  };

  export type TTemp = { key?: string; value?: string }[];
}

export namespace NJwt {}
