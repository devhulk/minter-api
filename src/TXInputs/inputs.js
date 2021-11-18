
import TXInput from "./input"

export default class TXInputs {
    constructor(txinputs) {
        this.txinputs = txinputs
    }

    get() {
        if (this.txinputs.length > 1) {
            let inputs = this.txinputs.map((input) => {
                let txinput = new TXInput(input)
                return txinput
            })

            return inputs
        } else {
            return new TXInput(this.txinputs[0]).get()
        }

    }
}