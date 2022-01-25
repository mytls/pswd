import crypto from "crypto-js";

class Pswd {
  constructor(public secret_key: string) {}

  dec(pswd: string) {
    const result = crypto.AES.decrypt(pswd, this.secret_key);
    return result.toString(crypto.enc.Utf8);
  }

  enc(message: any): string {
    const toJSON = JSON.stringify(message);
    const result = crypto.AES.encrypt(toJSON, this.secret_key).toString();
    return result;
  }
}

export default Pswd;
