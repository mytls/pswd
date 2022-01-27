import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import { RedisClientType, RedisModules, RedisScripts } from "redis";
import { customAlphabet } from "nanoid";
import { NextFunction, Request, Response } from "express";
import { IAuthConfig, NBlacklist, NJwt } from "./index.d";
import solver from "./config/solver";

const token = (req: Request, token_key: string) => {
  const chunks = (req.headers[token_key! as string]! as string).split(
    " "
  ) as string[];
  return chunks[chunks.length - 1];
};

class Blacklist {
  private declare configs: NBlacklist.IBlacklistConfigs;

  private executeConfigs(
    configs: NBlacklist.IBlacklistPromiseConfigs | NBlacklist.IBlacklistConfigs
  ) {
    let newConfigs: Partial<NBlacklist.IBlacklistConfigs> = {};
    (async () => {
      let i: keyof NBlacklist.IBlacklistConfigs;

      for (i in configs! as NBlacklist.IBlacklistPromiseConfigs) {
        let value = await configs[i];
        newConfigs[i] = value;
      }
    })();
    return newConfigs! as NBlacklist.IBlacklistConfigs;
  }

  config(
    configs: NBlacklist.IBlacklistPromiseConfigs | NBlacklist.IBlacklistConfigs
  ) {
    this.configs = this.executeConfigs(configs);
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
    callback: NBlacklist.IBlacklistAuthCallback<NBlacklist.IBlacklistTokenErrors>,
    config: IAuthConfig
  ) =>
    solver(async (req: Request, res: Response, next: NextFunction) => {
      const token_value = token(req, config.token_key);
      const keys = await this.configs.redisClient.keys("*");
      const values = (await this.configs.redisClient.mGet(keys)) as string[];
      let isBlocked = values.some(
        (value: string) => token_value.trim() === (value as string)!.trim()
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

  constructor(private secret_key: string) {
    this.blacklist = new Blacklist();
  }

  auth = (
    callback: NJwt.IBlacklistAuthCallback<NJwt.IJwtTokenErrors>,
    config: IAuthConfig
  ) =>
    solver(async (req: Request, res: Response, next: NextFunction) => {
      const token_value = token(req, config.token_key);
      try {
        const verified = jsonwebtoken.verify(token_value, this.secret_key);
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
}

export default Jwt;
