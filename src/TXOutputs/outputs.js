import TXOutput from "./output"

export default class TXOutputs {
    constructor(txoutputs) {
        this.txoutputs = txoutputs
    }

    get() {
        let outputs = this.txoutputs.map((output) => {
            let txoutput = new TXOutput(output)
            return txoutput
        })

        return outputs
    }

    getFirst() {
        let outputs = this.get()
        let first = outputs[0]

        return first
    }

    getSecond() {
        let outputs = this.get()
        let second = outputs[1]

        return second
    }
}