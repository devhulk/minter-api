export default class TXInput {
    constructor(txinput) {
        this.address = txinput.address
        this.amount = txinput.amount
        this.outpuIndex = txinput.outputIndex
        this.collateral = txinput.collateral
        this.dataHash = txinput.dataHash
    }

    get() {
        return {
            address: this.address,
            amount: this.amount,
            outputIndex = this.outpuIndex,
            collateral = this.collateral,
            dataHash = this.dataHash
        }
    }
}