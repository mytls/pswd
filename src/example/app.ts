import express, { Response } from "express";
import connect from "../config/connect";
import Pswd from "../pswd";
import solver from "../config/solver";

const app = express();

const secret_key = "12345";

const pswd = new Pswd(secret_key);

const client = connect(); //? redis client . It does not matter if the result is a promise or not

const configured = pswd.jwt.blacklist.config({
  redisClient: client,
});

app.use(
  pswd.solver(
    configured.auth(
      (result) => {
        if (result?.err) {
          return result.res?.json({
            ...result.err,
            message: "This token has already been blocked",
          }); //? Return a result when the token is blocked
          //? Prevent next operations
        }
      },
      {
        token_key: "authorization", //? token key Header
      }
    )
  )
);

app.get(
  "/",
  solver((req: Request, res: Response) => {
    return res.sendStatus(200);
  })
);

app.listen(3000, () => console.log("Listening on port 3000"));
