import WalletTXOutput from "./output"

export default class WalletTXOutputs {
    constructor(txoutputs) {
        this.txoutputs = txoutputs
    }

    get() {
        let outputs = this.txoutputs.map((output) => {
            let txoutput = new WalletTXOutput(output)
            return txoutput
        })

        return outputs
    }

    getFirst() {
        let outputs = this.txoutputs
        let first = new WalletTXOutput(outputs[0])

        return first
    }

    getSecond() {
        let outputs = this.txoutputs
        let second = new WalletTXOutput(outputs[1])

        return second
    }
}