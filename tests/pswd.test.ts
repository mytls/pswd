import { describe, it } from "mocha";
import Pswd from "../src/pswd";
import chai, { assert, expect } from "chai";
import connect from "./../src/config/connect";
import jsonwebtoken from "jsonwebtoken";

const secret_key = "12345";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCIkpXVCJ9.eyJlbWFpbCI6IkhlbGxvIHdvcmxkIiwiaWF0IjoxNjQzMTM0MTE3LCJleHAiOjE2NDM5OTgxMTd9.jKD23wZ96Eg6IezgTB4dcSpVfdmTzwpdAIdGN1sf0YM";

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
  it("should to be generate new token", () => {
    const result = jsonwebtoken.sign({ say: "Hello world" }, secret_key, {
      expiresIn: "1m",
    });
    console.log(result);
  });

  it("should add a token to blacklist", async () => {
    const client = await connect();
    (
      await ins.jwt.blacklist.config({
        redisClient: client,
      })
    ).add(token);
  });

  it("should to be get list of blacklist", async () => {
    const client = await connect();
    let result = await (
      await ins.jwt.blacklist.config({
        redisClient: client,
      })
    ).getList();

    try {
      const example = result[0];
      expect(example).to.have.any.keys("key", "value");
    } catch (e) {
      throw new Error("may be list has empty or key/value not exists");
    }
  });
});
