
import TXInput from "./input"

export default class TXInputs {
    constructor(txinputs) {
        this.txinputs = txinputs
    }

    get() {
            let inputs = this.txinputs.map((input) => {
                let txinput = new TXInput(input)
                return txinput
            })

            return inputs
    }

    getFirst() {
        let inputs = this.txinputs 

        return new TXInput(inputs[0])
    }
}