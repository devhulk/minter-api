export default class TXOutput {
    constructor(txoutput) {
        this.address = txoutput.address
        this.amount = txoutput.amount
        this.outpuIndex = txoutput.outputIndex
        this.dataHash = txoutput.dataHash
    }

    get() {
        return {
            address: this.address,
            amount: this.amount,
            outputIndex: this.outpuIndex,
            dataHash: this.dataHash
        }
    }
}