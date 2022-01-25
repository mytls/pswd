import { describe, it } from "mocha";
import Pswd from "../src/pswd";
import { expect } from "chai";

const secret_key = "12345";

describe("management passwords", () => {
  const ins = new Pswd(secret_key);
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
