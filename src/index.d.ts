import { Request, Response } from "express";

declare module "express" {
  export interface Response {
    client: any;
  }
}

type IBlacklistTokenErrors = "BLOCKED_TOKEN";

type IJwtTokenErrors = "JWT_EXPIRED" | "INVALID_SIGNATURE" | "INVALID_TOKEN";

interface IBlacklistCallbackParams<
  T extends IBlacklistTokenErrors | IJwtTokenErrors
> {
  err: { type: T; details?: object; [key: string]: string } | null;
  req?: Request;
  res?: Response;
  data?: any;
}
export interface IAuthConfig {
  token_key: string;
}

export interface IBlacklistAuthCallback<T> {
  ({ err, req, res, data }: IBlacklistCallbackParams<T>): any;
}
export namespace NBlacklist {
  export type TRedisClientType = RedisClientType<RedisModules, RedisScripts>;

  export interface IBlacklistConfigs {
    redisClient: TRedisClientType;
  }

  export type IBlacklistPromiseConfigs = {
    [B in keyof IBlacklistConfigs]: Promise<IBlacklistConfigs[B]>;
  };

  export type TTemp = { key?: string; value?: string }[];

  export {
    IBlacklistCallbackParams,
    IBlacklistTokenErrors,
    IBlacklistAuthCallback,
  };
}

export namespace NJwt {
  export { IBlacklistAuthCallback, IJwtTokenErrors };
}
