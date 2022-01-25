import { describe, it } from "mocha";
import Pswd from "../src/pswd";

const secret_key = "12345";

describe("management passwords", () => {
  const ins = new Pswd(secret_key);
  let passed_hash: string = "";

  it("should to be encrypt", () => {
    const result = ins.enc("Hello world");
    passed_hash = result;
  });

  it("should to be decrypt password", () => {
    const result = ins.dec(passed_hash);
    console.log(result);
  });
});
