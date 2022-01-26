import { describe, it } from "mocha";
import Pswd from "../src/pswd";
import { assert, expect } from "chai";
import connect from "./../src/config/connect";

const secret_key = "12345";

const ins = new Pswd(secret_key);
describe("encrypt/decrypt AES passwords", () => {
  let passed_hash: string = "";

  it("should to be encrypt", () => {
    const result = ins.enc("Hello world");
    passed_hash = result;
  });

  it("should to be decrypt password", () => {
    const password = ins.dec(passed_hash);
    expect(password).to.be.a("string").not.empty;
  });
});

describe("manage jwt tokens", () => {
  // it("should to be generate new token", () => {
  //   const result = ins.jwt.gen();
  //   console.log(result);
  // });

  it("should add a token to blacklist", async () => {
    const client = await connect();
    await ins.jwt.blacklist
      .config({
        redisClient: client,
      })
      .add(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IkhlbGxvIHdvcmxkIiwiaWF0IjoxNjQzMTM0MTE3LCJleHAiOjE2NDM5OTgxMTd9.jKD23wZ96Eg6IezgTB4dcSpVfdmTzwpdAIdGN1sf0YM"
      );
  })

  it("should to be get list of blacklist", async () => {
    const client = await connect();
    let result = await ins.jwt.blacklist
      .config({
        redisClient: client,
      })
      .getList();

    try {
      expect(result[0]).to.have.any.keys("key", "value");
    } catch (e) {
      throw new Error("may be list has empty or key/value not exists");
    }
  });
});
