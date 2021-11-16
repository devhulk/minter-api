export default class Metadata {
    constructor(data) {
        this.policy_id = data.policy_id
        this.policy_name = data.policy_name
        this.asset_id = data.asset_id
        this.asset_name = data.asset_name
        this.imageLink = data.imageLink
        this.ipfsLink = data.ipfsLink
        this.traits = data.traits
        this.amount = data.amount
    }

    format() {
        return `{
  "721": {
    "${this.policy_id}": {
      "${this.asset_name}": {
        "name": "${this.asset_name}",
        "mediaType": "image/png",
        "image": "${this.imageLink}",
        "imageLink": "${this.ipfsLink}",
        "attributes": ${JSON.stringify(this.traits)},
        "amount": "${this.amount}",
        "ticker": "${this.asset_id}"
      }
    }
  }
}
`
    }
}