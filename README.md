# Coinspot SDK
Unoficial coinspot sdk. Contains all endpoints from https://www.coinspot.com.au/api as well as couple custom methods, that I needed for my other project.

## Usage 
```
const coinspot = require('coinspot');

const client = new coinspot(key, secret, readonly);
```
<i>string</i><b> key </b> and <i>string</i><b> secret </b> are can be generated on coinspot, account page. 

<i>boolean</i><b> readonly</b> when true, only readonly endpoints can be called 

## Nonce
Each coinspot API call requires <b>nonce</b> - An integer value which must always be greater than the previous requests nonce value. 

Current logic gets current timestamp on library initialisation, and adds 1 before each call. 

This is pretty annoying and creates race conditions. 

If multiple calls need to be made consider wrapping each call in 

```
makeApiCall(coin, idx) {
      return new Promise(resolve => setTimeout(
        () => resolve(client.coinTransactionHistory(coin)),
        100 * idx)
      );
    };
```

## Methods 
### Latest price
```
latestPrice()
```

### List open orders
```
orders(cointype)
```

### List Order History
```
orderHistory(cointype)
```

### Deposit coin
```
coindeposit(cointype)
```

###  Quick Buy Quote
```
quotebuy(cointype, amount)
```

###  Quick Sell Quote
```
quotesell(cointype, amount)
```

###  List My Balances
```
balances()
```

###  List My Orders
```
myorders()
```

###  Place Buy Order
```
buy(cointype, amount, rate)
```

###  Place Sell Order
```
sell(cointype, amount, rate)
```

### Cancel Buy Order
```
buyCancel(ID)
```

### Cancel Sell Order
```
sellCancel(ID)
```

### Coin Balance
```
coinBalance(cointype)
```

### List Deposit History
```
depositHistory(startdate, enddate)
```

### List Withdrawal History
```
withdrawalHistory(startdate, enddate)
```

## Readonly 
### List Withdrawal History
```
transactionHistory(startdate, enddate)
```

### List My Coin Transaction History
```
coinTransactionHistory(cointype, startdate, enddate)
```

### List My Coins Transaction History
```
coinsTransactionHistory(cointypeArray, startdate, enddate)
```

### List My Open Transactions
```
openTransactions()
```

### List My Coins Open Transactions
```
coinOpenTransactions(cointype)
```

### List My Send & Receive Transaction History
```
sendReceive()
```

### List Affiliate Payments
```
affiliatePayments()
```

### List My Referral Payments
```
referralPayments()
```






