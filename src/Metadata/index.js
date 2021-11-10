export default class Metadata {
    constructor(data) {
        this.policy_id = data.policy_id
        this.policy_name = data.policy_name
        this.asset_id = data.asset_id
        this.asset_name = data.asset_name
        this.ipfsLink = data.ipfsLink
        this.traits = data.traits
    }

    format() {
        return `{
            "721": {
              "${this.policy_id}": {
                "${this.asset_id}": {
                  "name": "${this.asset_name}",
                  "image": "${this.ipfsLink}",
                  "traits": ${JSON.stringify(this.traits)}
                }
              }
            }
          }
          `
    }
}