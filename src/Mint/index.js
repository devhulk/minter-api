const { spawn } = require('child_process');

export default class Minter {
    constructor() {}

    getProtocolParams () {
    // 3. Get protocol params
        let promise = new Promise((resolve, reject) => {

            let config = 'testnet'
            let network = config == 'testnet' ? '--testnet-magic' : '--mainnet'
            let magic = network == '--testnet-magic' ? '1097911063' : ''
            const params = spawn('cardano-cli', ['query', 'protocol-parameters', network, magic])

            params.stdout.on('data', (data) => {
                console.log("Data: ", data)
                resolve(data)
            })

            params.stderr.on('data', (data) => {
                console.error("Error: ", data)
                reject(data)
            })

        })
        return promise
    }

    generatePolicy() {
    // 4. Create Policy Keys and Policy Script

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