# pswd

**easy to encrypt/decrypt data with crypto-js**

**manage jsonwebtoken blacklists**

> You need a blacklist for more security in the tokens you created using jwt. When the user logs out of his account and if his token is still valid, he can copy and use it before leaving the account, but you can add his token to the blacklist after leaving the account, which can no longer be used .

### requirement for jwt blacklist

-redis


**install**
 
  `npm i @mmdzov/pswd`
  
