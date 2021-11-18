export default class WalletTXInput {
    constructor(txinput) {
        this.address = txinput.address
        this.amount = txinput.amount
        this.outpuIndex = txinput.output_index
        this.collateral = txinput.collateral
        this.dataHash = txinput.data_hash
    }

    get() {
        return {
            address: this.address,
            amount: this.amount,
            outputIndex:  this.outpuIndex,
            collateral:  this.collateral,
            dataHash:  this.dataHash
        }
    }
}