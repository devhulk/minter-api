const { spawn } = require('child_process');

export default class Minter {
    constructor() {}

    getProtocolParams () {
        let network = '--testnet-magic 1097911063'
        const params = spawn('cardano-cli', ['query', 'protocol-parameters', network])

        params.stdout.on('data', (data) => {
            console.log(data)
        })
    }

    // Steps to Mint
    // 1. Create Wallet with Payment Address
    // 2. Fund Wallet
    // 3. Get protocol params
    // 4. Create Policy Keys and Policy Script
    // 5. Generate PolicyID
    // 6. Retrieve token Metadata
    // 7. Build Raw TX -> Calculate Fee -> Sign TX -> Submit TX
}