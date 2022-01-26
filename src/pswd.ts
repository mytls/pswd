import crypto from "crypto-js";
import Jwt from "./jwt";

class Pswd {
  declare jwt: Jwt;
  constructor(private secret_key: string) {
    this.jwt = new Jwt();
  }

  dec(pswd: string) {
    const result = crypto.AES.decrypt(pswd, this.secret_key);
    return result.toString(crypto.enc.Utf8).replace(/\\"|\"/gm, "");
  }

  enc(message: any): string {
    const toJSON = JSON.stringify(message);
    const result = crypto.AES.encrypt(toJSON, this.secret_key).toString();
    return result;
  }
}

export default Pswd;
