// server.js
const fastify = require('fastify')({ logger: true });
//const fastify = require('fastify')({ logger: true });
const fastifyCors = require('@fastify/cors');
// 启用 CORS
fastify.register(fastifyCors, {
  origin: true
});
// 假设的 Ripple 地址和余额
let rippleData = {
  address: "rstrmBnfpuJRVdU2oEKTpyxg4KZwSpnRY1",
  balance: "1000"
};

const xrpl = require("xrpl");

// 默认路由，返回 'Hello World'
fastify.get('/', async (request, reply) => {
  return 'Hello World';
});

// 获取 Ripple 地址的 API
fastify.get('/ripple-address', async (request, reply) => {
    const test_wallet = xrpl.Wallet.fromSeed("sEdSPg3KgzfoVY7h6f5HvihJkQNWkTG")
    rippleData.address = test_wallet.address;

  return { address: rippleData.address };
});

// 获取 Ripple 余额的 API
fastify.get('/ripple-balance', async (request, reply) => {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
    await client.connect()
    const test_wallet = xrpl.Wallet.fromSeed("sEdSPg3KgzfoVY7h6f5HvihJkQNWkTG")
    
    const response = await client.request({
        "command": "account_info",
        "account": test_wallet.address,
        "ledger_index": "validated"
      })
      balance = response.result.account_data.Balance/1000000;
      console.log(balance)
    
    
    await client.disconnect()
    rippleData.balance = balance;
  return { balance: rippleData.balance };
});

fastify.post('/mint-badge', async (request, reply) => {
    const { badgeType } = request.body; // 从请求体中获取徽章类型
  
    // 这里仅作演示，您可以根据需要实现具体逻辑
    console.log(`Minting ${badgeType} badge...`);
    let ipfs = badgeType==="gold" ? "ipfs://QmRShxQ8HnQBprHDaZtCAhgQmKrmNChrDBXneayf6EKnPN" : badgeType === "silver" ? "ipfs://Qmf4nW1e7PKZHDW4kEpjgUXsickv8QvA2Jvo7ns8nQ4X2y" : "ipfs://QmZzd4jE3GYmGmJ4ncZjhaKwVSSQmK6CD7nmKpHJiYqAWP";
    // 假设的操作结果
    if (badgeType.startsWith("ipfs")) {
        ipfs = badgeType;
    }
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
    await client.connect()
    const standby_wallet = xrpl.Wallet.fromSeed("sEdSPg3KgzfoVY7h6f5HvihJkQNWkTG")
    const transactionJson = {
        "TransactionType": "NFTokenMint",
        "Account": rippleData.address,
        "URI": xrpl.convertStringToHex(ipfs),
        "Flags": parseInt(8),
        "TransferFee": parseInt(10000),
        "NFTokenTaxon": 0 //Required, but if you have no use for it, set to zero.
    }

    const tx = await client.submitAndWait(transactionJson, { wallet: standby_wallet} )
    await client.disconnect()
    return { result: tx };
  });

// 启动服务器
/*
const start = async () => {
  try {
    const PORT = process.env.PORT || 3000;
    await fastify.listen(PORT);
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
*/
module.exports = fastify;