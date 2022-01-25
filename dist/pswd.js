"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_js_1 = __importDefault(require("crypto-js"));
var Pswd = /** @class */ (function () {
    function Pswd(secret_key) {
        this.secret_key = secret_key;
    }
    Pswd.prototype.dec = function (pswd) {
        var result = crypto_js_1.default.AES.decrypt(pswd, this.secret_key);
        return result.toString(crypto_js_1.default.enc.Utf8).replace(/\\"|\"/gm, "");
    };
    Pswd.prototype.enc = function (message) {
        var toJSON = JSON.stringify(message);
        var result = crypto_js_1.default.AES.encrypt(toJSON, this.secret_key).toString();
        return result;
    };
    return Pswd;
}());
exports.default = Pswd;
