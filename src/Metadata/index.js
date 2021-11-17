export default class Metadata {
    constructor(data) {
        this.policy_id = data.policy_id
        this.policy_name = data.policy_name
        this.name = data.name
        this.ticker = data.ticker
        this.imageLink = data.imageLink
        this.image = data.image
        this.attributes = data.attributes
        this.amount = data.amount
    }

    format() {
        return `{
  "721": {
    "${this.policy_id}": {
      "${this.name}": {
        "name": "${this.name}",
        "mediaType": "image/png",
        "image": "${this.image}",
        "imageLink": "${this.ipfsLink}",
        "attributes": ${JSON.stringify(this.traits)},
        "amount": "${this.amount}",
        "ticker": "${this.ticker}"
      }
    }
  }
}
`
    }
}