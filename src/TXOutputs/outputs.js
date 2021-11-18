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
}