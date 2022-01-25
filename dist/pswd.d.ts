declare class Pswd {
    private secret_key;
    constructor(secret_key: string);
    dec(pswd: string): string;
    enc(message: any): string;
}
export default Pswd;
