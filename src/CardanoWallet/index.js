import axios from "axios"
const bip39 = require('bip39')


export default class CardanoWallet {
    constructor() {}

    createWallet(options) {
        let promise = axios.post('http://localhost:8090/v2/wallets', {
            name: options.name,
            mnemonic_sentence: options.mnemonic,
            passphrase: options.passphrase
          })

        let dataPromise = promise.then((response) => response.data)
        
        return dataPromise 
    }

    getWalletAddress(options) {
      let walletID = options.id

      let promise = axios.get(`http://localhost:8090/v2/wallets/${walletID}/addresses?state=unused`)

      let dataPromise = promise.then((response) => response.data)

      return dataPromise

    }

    getInfo() {
        let promise = axios.get("http://localhost:8090/v2/network/information")

        let dataPromise = promise.then((response) => response.data)

        return dataPromise
    }

    createMnemonic() {
      const mnemonic = bip39.generateMnemonic(256).split(" ")
      console.log(mnemonic)
      return mnemonic
    }
}
