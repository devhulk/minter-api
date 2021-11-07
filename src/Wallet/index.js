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
        return axios.get("http://localhost:8090/v2/network/information")
    }
}