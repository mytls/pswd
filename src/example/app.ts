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

//* jwt checkpoint
const checkpoint = configured.auth(
  (result) => {
    if (result?.err) {
      return result.res?.json({
        ...result.err,
        message: "This token has already been blocked",
      }); //? Return a result when the token is blocked
      //? Prevent next operations
    }
    //? NOTE: There is no need to implement the next function because when the validation is confirmed, next runs behind the scenes
  },
  {
    token_key: "authorization", //? token key Header
  }
);

//* jwt auth
const auth = pswd.jwt.auth(
  (result) => {
    if (result.err?.type) {
      return result.res?.json({
        type: result.err.type,
      });
      //? Prevent next operations
    }
    console.log(result.data);
    //? NOTE: There is no need to implement the next function because when the validation is confirmed, next runs behind the scenes
  },
  {
    token_key: "authorization",
  }
);

app.use(checkpoint); //? Token checkpoint to check for blockage

app.use(auth);

app.get(
  "/",
  solver((req: Request, res: Response) => {
    return res.sendStatus(200);
  })
);

app.listen(3000, () => console.log("Listening on port 3000"));
