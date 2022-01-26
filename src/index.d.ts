import { Request, Response } from "express";

declare module "express" {
  export interface Response {
    client: any;
  }
}

export namespace NBlacklist {
  export interface IBlacklistAuthConfig {
    token_key: string;
  }

  type IBlacklistTokenErrors = "BLOCKED_TOKEN";

  interface IBlacklistCallbackParams {
    err: { type: IBlacklistTokenErrors } | null;
    req?: Request;
    res?: Response;
    data?: any;
  }

  export interface IBlacklistAuthCallback {
    ({ err, req, res, data }: IBlacklistCallbackParams): any;
  }

  export type TRedisClientType = RedisClientType<RedisModules, RedisScripts>;

  export interface IBlacklistConfigs {
    redisClient: TRedisClientType;
  }

  export type IBlacklistPromiseConfigs = {
    [B in keyof IBlacklistConfigs]: Promise<IBlacklistConfigs[B]>;
  };

  export type TTemp = { key?: string; value?: string }[];
}
