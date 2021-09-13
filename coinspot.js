const hmac = require("crypto").createHmac;
const fetch = require('node-fetch');

function coinspot(key, secret, readonly) {
  const self = this;
  self.key = key;
  self.secret = secret;
  self.readonly = readonly;
  self.lastNonce = new Date().getTime();

  const request = async (path, data, cointype, privateEndpoint = true) => {

    if (self.readonly && privateEndpoint) {
      return { status: 'error', message: 'Client running in readonly mode' };
    }

    const nonce = self.lastNonce + 1;
    self.lastNonce = nonce;
    const postdata = data || {};
    postdata.nonce = nonce;

    const stringmessage = JSON.stringify(postdata);
    const signedMessage = new hmac("sha512", self.secret);
    signedMessage.update(stringmessage);
    const sign = signedMessage.digest('hex');

    const url = 'https://www.coinspot.com.au' + path;
    const options = {
      method: 'post',
      body: stringmessage,
      headers: {
        'Content-Type': 'application/json',
        'sign': sign,
        'key': self.key
      },
    };

    return await new Promise((resolve, reject) => {
      fetch(url, options)
        .then(res => res.text())
        .then(body => {
          if (body.status === 'error') {
            return reject(body.message);
          }
          const jsonBody = JSON.parse(body);
          if (cointype) {
            jsonBody.coin = cointype;
          }
          resolve(jsonBody);
        })
        .catch(error => reject(error));
    });
  };

  /**
   * Latest price
   */
  self.latestPrice = async () => {
    return await request('/pubapi/latest', {});
  };

  /**
   * List open orders
   * @param {string} cointype  the coin shortname, example value 'BTC', 'LTC', 'DOGE'
   */
  self.orders = async (cointype) => {
    return await request('/api/orders', { cointype }, cointype);
  };

  /**
   * List Order History
   * @param {string} cointype  the coin shortname, example value 'BTC', 'LTC', 'DOGE'
   */
  self.orderHistory = async (cointype) => {
    return await request('/api/orders/history', { cointype }, cointype);
  };

  /**
   * Deposit coin
   * @param {string} cointype  the coin shortname, example value 'BTC', 'LTC', 'DOGE'
   * @returns address - your deposit address for the coin
   */
  self.coindeposit = async (cointype) => {
    return await request('/api/my/coin/deposit', { cointype }, cointype);
  };

  /**
    * Quick Buy Quote
    * @param {string} cointype  the coin shortname, example value 'BTC', 'LTC', 'DOGE'
    * @param {number} amount  the amount of coins to buy
    * @returns quote - the rate per coin
    * @returns timeframe - estimate hours to wait for trade to complete (0 = immediate trade)
    */
  self.quotebuy = async (cointype, amount) => {
    return await request('/api/quote/buy', { cointype, amount }, cointype);
  };

  /**
    * Quick Sell Quote
    * @param {string} cointype  the coin shortname, example value 'BTC', 'LTC', 'DOGE'
    * @param {number} amount  the amount of coins to buy
    * @returns quote - the rate per coin
    * @returns timeframe - estimate hours to wait for trade to complete (0 = immediate trade)
    */
  self.quotesell = async (cointype, amount) => {
    return await request('/api/quote/sell', { cointype, amount }, cointype);
  };

  /**
   * List My Balances
   * @returns balances - object containing one property for each coin with your balance for that coin.
   */
  self.balances = async () => {
    const res = await request('/api/ro/my/balances', {});
    const cryptos = [];
    res.balances.forEach(bal => {
      for (const [key, value] of Object.entries(bal)) {
        cryptos.push({ name: key, ...value });
      }
    });
    return cryptos;
  };

  /**
   * List My Orders
   * @returns buyorders - array containing all your buy orders
   * @returns sellorders - array containing all your sell orders
   *
   */
  self.myorders = async () => {
    return await request('/api/my/orders', {});
  };

  /**
   * Place Buy Order
   * @param {string} cointype - the coin shortname, example value 'BTC', 'LTC', 'DOGE'
   * @param {number} amount - the amount of coins you want to buy, max precision 8 decimal places
   * @param {number} rate - the rate in AUD you are willing to pay, max precision 6 decimal places
   */
  self.buy = async (cointype, amount, rate) => {
    return await request('/api/my/buy', { cointype, amount, rate }, cointype);
  };

  /**
   * Place Sell Order
   * @param {string} cointype - the coin shortname, example value 'BTC', 'LTC', 'DOGE'
   * @param {number} amount - the amount of coins you want to buy, max precision 8 decimal places
   * @param {number} rate - the rate in AUD you are willing to pay, max precision 6 decimal places
   */
  self.sell = async (cointype, amount, rate) => {
    return await request('/api/my/sell', { cointype, amount, rate }, cointype);
  };

  /**
   * Cancel Buy Order
   * @param {string} id - the id of the order to cancel
   */
  self.buyCancel = async (id) => {
    return await request('/api/my/buy/cancel', { id });
  };

  /**
   * Cancel Sell Order
   * @param {string} id - the id of the order to cancel
   */
  self.sellCancel = async (id) => {
    return await request('/api/my/sell/cancel', { id });
  };

  /**
 * Coin Balance
 * @readonly
 * @param {string} cointype - the coin shortname, example value 'BTC', 'LTC', 'DOGE'
 * @returns balance - object containing one property with your balance, AUD value and rate for that coin
 */
  self.coinBalance = async (cointype) => {
    return await request(`/api/ro/my/balances/${cointype}`, {}, cointype, false);
  };

  /**
   * List Deposit History
   * @readonly
   * @param {string} startdate - (optional) format 'YYYY-MM-DD'
   * @param {string} enddate - (optional) format 'YYYY-MM-DD'
   * @returns deposits - array containing your AUD deposit history
   */
  self.depositHistory = async (startdate, enddate) => {
    return await request('/api/ro/my/deposits', { startdate, enddate }, {}, false);
  };

  /**
   *List Withdrawal History
   * @readonly
   * @param {string} startdate - (optional) format 'YYYY-MM-DD'
   * @param {string} enddate - (optional) format 'YYYY-MM-DD'
   * @returns withdrawals - array containing your AUD withdrawal history
   */
  self.withdrawalHistory = async (startdate, enddate) => {
    return await request('/api/ro/my/withdrawals', { startdate, enddate }, {}, false);
  };

  /**
   *List My Transaction History
   * @readonly
   * @param {string} startdate - format 'YYYY-MM-DD'
   * @param {string} enddate - format 'YYYY-MM-DD'
   * @returns buyorders - array containing your buy order history
   * @returns sellorders - array containing your sell order history
   */
  self.transactionHistory = async (startdate, enddate) => {
    return await request('/api/ro/my/transactions', { startdate, enddate }, {}, false);
  };

  /**
   *List My Coin Transaction History
   * @readonly
   * @param {string} cointype - the coin shortname, example value 'BTC', 'LTC', 'DOGE'
   * @param {string} startdate - (optional) format 'YYYY-MM-DD'
   * @param {string} enddate - (optional) format 'YYYY-MM-DD'
   * @returns buyorders - array containing your buy order history
   * @returns sellorders - array containing your sell order history
   */
  self.coinTransactionHistory = async (cointype, startdate, enddate) => {
    return await request(`/api/ro/my/transactions/${cointype}`, { startdate, enddate }, cointype, false);
  };

  /**
     *List My Coins Transaction History
     * @readonly
     * @param {string} coinstype - an array of coins shortname, example value ['BTC', 'LTC', 'DOGE']
     * @param {string} startdate - (optional) format 'YYYY-MM-DD'
     * @param {string} enddate - (optional) format 'YYYY-MM-DD'
     * @returns buyorders - array containing your buy order history
     * @returns sellorders - array containing your sell order history
     */
  self.coinsTransactionHistory = async (coinstype, startdate, enddate) => {
    const fn = function makeApiCall(coin, idx) {
      return new Promise(resolve => setTimeout(() => resolve(
        request(`/api/ro/my/transactions/${coin}`, { startdate, enddate }, coin, false)), 100 * idx));
    };
    const actions = coinstype.map((c, idx) => fn(c, idx));
    const results = await Promise.all(actions);
    return results;
  };

  /**
   *List My Open Transactions
   * @readonly
   * @returns buyorders - array containing your open buy orders
   * @returns sellorders - array containing your open sell orders
   */
  self.openTransactions = async () => {
    return await request('/api/ro/my/transactions/open', {}, {}, false);
  };

  /**
   *List My Coins Open Transactions
   * @readonly
   * @param {string} cointype - the coin shortname, example value 'BTC', 'LTC', 'DOGE'
   * @returns buyorders - array containing your coin open buy orders
   * @returns sellorders - array containing your coin open buy orders
   */
  self.coinOpenTransactions = async (cointype) => {
    return await request(`/api/ro/my/transactions/${cointype}/open`, {}, cointype, false);
  };

  /**
   * List My Send & Receive Transaction History
   * @readonly
   * @returns sendtransactions - array containing your coin send transaction history
   * @returns receivetransactions - array containing your coin receive transaction history
   */
  self.sendReceive = async () => {
    return await request(`/api/ro/my/sendreceive`, {}, {}, false);
  };

  /**
   * List Affiliate Payments
   * @readonly
   * @returns payments - array containing one object for each completed affiliate payment
   */
  self.affiliatePayments = async () => {
    return await request(`/api/ro/my/affiliatepayments`, {}, {}, false);
  };

  /**
   * List My Referral Payments
   * @readonly
   * @returns payments - array containing one object for each completed referral payment
   */
  self.affiliatePayments = async () => {
    return await request('/api/ro/my/referralpayments', {}, {}, false);
  };

};

module.exports = coinspot;;;;