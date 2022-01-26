import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import { RedisClientType, RedisModules, RedisScripts } from "redis";
import { customAlphabet } from "nanoid";

interface IBlacklistConfigs {
  redisClient: RedisClientType<RedisModules, RedisScripts>;
}

class Blacklist {
  private declare configs: IBlacklistConfigs;

  config(configs: IBlacklistConfigs) {
    this.configs = configs;
    return this;
  }

  async add(token: string) {
    try {
      let result = jsonwebtoken.decode(token) as JwtPayload;
      await this.configs.redisClient.set(
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
      const keys = await this.configs.redisClient.keys("BLACKLIST_TOKEN_*");
      const values = await this.configs.redisClient.mGet(keys);
      let temp: { key?: string; value?: string }[] = [];

      for (let i in keys) {
        const key = keys[i]!;
        const value = values[i]!;
        temp[i] = { key, value };
      }

      return temp;
    } catch (e: any) {
      throw new Error(e);
    }
  }
}

class Jwt {
  public declare blacklist: Blacklist;

  constructor() {
    this.blacklist = new Blacklist();
  }
}

export default Jwt;
