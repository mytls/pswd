import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import { customAlphabet } from "nanoid";
import { NextFunction, Request, Response } from "express";
import {
  IAuthCallback,
  IAuthConfig,
  IBlacklistTokenErrors,
  IJwtTokenErrors,
  NBlacklist,
  TRedisClientType,
} from "./index.d";
import solver from "./config/solver";

const token = (
  req: Request,
  token_key: string
): {
  token?: string;
  err?: {
    type: "UNDEFINED_TOKEN";
  } | null;
} => {
  const header = req.headers[token_key! as string]! as string;
  if (!header) {
    return {
      err: {
        type: "UNDEFINED_TOKEN",
      },
    };
  }
  const chunks = header?.split(" ") as string[];
  return {
    token: chunks[chunks.length - 1],
    err: null,
  };
};

type IConfigs<T extends object> =
  | NBlacklist.IBlacklistPromiseConfigs<T>
  | (NBlacklist.IBlacklistConfigs & T);

interface ExecuteConfigType {
  executeConfigs(configs: IConfigs<{}>): NBlacklist.IBlacklistConfigs;
}

class Configs implements ExecuteConfigType {
  executeConfigs(configs: IConfigs<{}>): NBlacklist.IBlacklistConfigs {
    let newConfigs: Partial<NBlacklist.IBlacklistConfigs> = {};
    (async () => {
      let i: keyof NBlacklist.IBlacklistConfigs;

      for (i in configs! as NBlacklist.IBlacklistPromiseConfigs<{}>) {
        let value = await configs[i];
        newConfigs[i] = value;
      }
    })();
    return newConfigs! as NBlacklist.IBlacklistConfigs;
  }
}

class Blacklist {
  private declare configs: NBlacklist.IBlacklistConfigs;

  config(configs: IConfigs<{}>) {
    this.configs = new Configs().executeConfigs(configs);
    return this;
  }

  async add(token: string) {
    try {
      let result = jsonwebtoken.decode(token) as JwtPayload;
      (await this.configs.redisClient).set(
        `BLACKLIST_TOKEN_${customAlphabet("123456789", 10)()}`,
        token,
        {
          PX: result?.exp!,
        }
      );
      return true;
    } catch (e: any) {
      throw new Error(e);
    }
  }

  async getList() {
    try {
      const client = this.configs.redisClient;
      const keys = (await client.keys("BLACKLIST_TOKEN_*")) as string[];
      const values = await client.mGet(keys);

      let temp: NBlacklist.TTemp = [];

      let i: string;

      for (i in keys) {
        const key = keys[i]!;
        const value = values[i]!;
        temp[i] = { key, value };
      }

      return temp;
    } catch (e: any) {
      throw new Error(e);
    }
  }

  auth = (
    callback: IAuthCallback<IBlacklistTokenErrors>,
    config: IAuthConfig
  ) =>
    solver(async (req: Request, res: Response, next: NextFunction) => {
      const { token: token_value, err: token_error } = token(
        req,
        config.token_key
      );
      if (token_error?.type)
        return await callback({ err: token_error, req, res, data: "" });
      const keys = await this.configs.redisClient.keys("*");
      const values = (await this.configs.redisClient.mGet(keys)) as string[];
      let isBlocked = values.some(
        (value: string) => token_value?.trim() === (value as string)!.trim()
      );

      if (!isBlocked) {
        callback({ err: null, req, res, data: token_value });
        return next();
      }

      await callback({
        err: {
          type: "BLOCKED_TOKEN",
        },
        data: token_value,
        req,
        res,
      });
    });
}

class Jwt {
  public declare blacklist: Blacklist;
  private declare exec: ExecuteConfigType;

  constructor(private secret_key: string) {
    this.blacklist = new Blacklist();
  }

  auth = (callback: IAuthCallback<IJwtTokenErrors>, config: IAuthConfig) =>
    solver(async (req: Request, res: Response, next: NextFunction) => {
      const { token: token_value, err: token_error } = token(
        req,
        config.token_key
      );
      if (token_error?.type) {
        return await callback({ err: token_error, res, req, data: "" });
      }
      try {
        const verified = jsonwebtoken.verify(token_value!, this.secret_key);
        await callback({ err: null, res, req, data: verified });
        return next();
      } catch (e: any) {
        await callback({
          err: {
            type: e?.message?.includes("expired")
              ? "JWT_EXPIRED"
              : e.message?.includes("invalid token")
              ? "INVALID_TOKEN"
              : "INVALID_SIGNATURE",
            details: e,
          },
          req,
          res,
          data: {},
        });
      }
    });

  /**
   *
   * @description auto manage checkpoint and auth
   *
   */

  auto = (
    callback: IAuthCallback<IJwtTokenErrors | IBlacklistTokenErrors>,
    configs: IConfigs<{ token_key: string }>
  ) =>
    solver(async (req: Request, res: Response, next: NextFunction) => {
      let client: TRedisClientType = await configs.redisClient;

      const { token: token_value, err: token_error } = token(
        req,
        configs.token_key
      );
      if (token_error?.type) {
        return await callback({ err: token_error, res, req, data: "" });
      }
      try {
        const verified = jsonwebtoken.verify(token_value!, this.secret_key);
        let keys = await client.keys("BLACKLIST_TOKEN_*");
        let isBlocked = (await client.mGet(keys)).some(
          (item) => item === token_value
        );
        if (!isBlocked) {
          await callback({ err: null, res, req, data: verified });
          return next();
        }
        await callback({
          err: {
            type: "BLOCKED_TOKEN",
          },
          res,
          req,
          data: verified,
        });
        return;
      } catch (e: any) {
        await callback({
          err: {
            type: e?.message?.includes("expired")
              ? "JWT_EXPIRED"
              : e.message?.includes("invalid token")
              ? "INVALID_TOKEN"
              : "INVALID_SIGNATURE",
            details: e,
          },
          req,
          res,
          data: {},
        });
      }
    });
}

export default Jwt;
