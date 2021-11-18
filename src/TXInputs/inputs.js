
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

    getPayments() {
            let inputs = this.txinputs.map((input) => {
                let txinput = new WalletTXInput(input)
                let tokens = txinput.amount
                return tokens
            })

            return inputs
    }
    getPayment() {
        let input = new WalletTXInput(this.txinputs[0])

        let payment = input.amount
        
        return payment
    }
}