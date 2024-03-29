
import WalletTXInput from "./input"

export default class WalletTXInputs {
    constructor(txinputs) {
        this.txinputs = txinputs
    }

    get() {
            let inputs = this.txinputs.map((input) => {
                let txinput = new WalletTXInput(input)
                return txinput
            })

            return inputs
    }

    getFirst() {
        let inputs = this.txinputs 

        return new WalletTXInput(inputs[0])
    }

    getInputAmounts() {
        let amounts = this.txinputs.map((input) => {
                let txinput = new WalletTXInput(input)
                // console.log(txinput.amount)
                return txinput.amount
            })
        let tokens = amounts.map((token) => {
            // console.log(token)
            // let tokenObj = {}
            // tokenObj[token.unit] = token.quantity
            return token
        })
            console.log(tokens)

            return tokens
    }
    getFirstInputAmount() {
        let input = new WalletTXInput(this.txinputs[0])

        let payment = input.amount[0]
        
        return payment
    }
}