"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_js_1 = __importDefault(require("crypto-js"));
class Pswd {
    constructor(secret_key) {
        this.secret_key = secret_key;
    }
    dec(pswd) {
        const result = crypto_js_1.default.AES.decrypt(pswd, this.secret_key);
        return result.toString();
    }
    enc(message) {
        const toJSON = JSON.stringify(message);
        const result = crypto_js_1.default.AES.encrypt(toJSON, this.secret_key).toString();
        return result;
    }
}
exports.default = Pswd;
