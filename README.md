# pswd

**easy to encrypt/decrypt data with crypto-js**

**manage jsonwebtoken blacklists**

> You need a blacklist for more security in the tokens you created using jwt. When the user logs out of his account and if his token is still valid, he can copy and use it before leaving the account, but you can add his token to the blacklist after leaving the account, which can no longer be used .

### requirement for jwt blacklist

-redis


<span style="color:orange;">Word up</span>

**install**
 
  `npm i @mmdzov/pswd`
  

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
