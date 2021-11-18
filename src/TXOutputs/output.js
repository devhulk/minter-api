export default class WalletTXOutput {
    constructor(txoutput) {
        this.address = txoutput.address
        this.amount = txoutput.amount
        this.outpuIndex = txoutput.output_index
        this.dataHash = txoutput.data_hash
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