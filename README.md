# pswd

### Validation, Authentication, Encryption. Simple and powerful

**easy to encrypt/decrypt data with crypto-js**

**manage jsonwebtoken blacklists**

> You need a blacklist for more security in the tokens you created using jwt. When the user logs out of his account and if his token is still valid, he can copy and use it before leaving the account, but you can add his token to the blacklist after leaving the account, which can no longer be used .

### requirement for jwt blacklist

-redis

**install**
 
```npm
npm i @mmdzov/pswd
```
  

**Usage**

*Add Token to blacklist*
```javascript
const secret_key = "12345"
const ins = new Pswd(secret_key);
const client = await connect(); // return redis client
await ins.jwt.blacklist.config({ redisClient: client }).add("user_token"); // return boolean

```

*Get list of blacklist*
```javascript
const client = await connect();
let result = await ins.jwt.blacklist.config({ redisClient: client }).getList(); //return array of object blacklist. like: [{ key: "BLACKLIST_TOKEN_3423473676", value: "TOKEN" }]
```


### You can make the validation of your jwt tokens much easier, see the example below

```javascript
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
```

### You can also check the authorization and blacklist together and create a complete and simple checkpoint

```javascript

const secret_key = "12345";

const pswd = new Pswd(secret_key);

const config = {
  redisClient: client,
  token_key: "authorization",
};

const auto = pswd.jwt.auto(({ err, res }) => {
  if (err?.type) {
    return res.json({
      type: err?.type,
    });
  }
}, config);

app.use(auto);
```
