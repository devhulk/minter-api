import axios from "axios"

export default class Wallet {
    constructor() {}

    create() {
        console.log("I'm creating a wallet")
        axios.post('localhost', {
            Name: 'Fred',
            Age: '23'
          })
          .then(function (response) {
            console.log(response);
          })
    }

    getInfo() {
        let promise = axios.get("http://localhost:8090/v2/network/information")

        let dataPromise = promise.then((response) => response.data)

        return dataPromise
    }
}
