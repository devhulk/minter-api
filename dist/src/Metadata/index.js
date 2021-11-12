"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Metadata = function () {
  function Metadata(data) {
    _classCallCheck(this, Metadata);

    this.policy_id = data.policy_id;
    this.policy_name = data.policy_name;
    this.asset_id = data.asset_id;
    this.asset_name = data.asset_name;
    this.ipfsLink = data.ipfsLink;
    this.traits = data.traits;
    this.amount = data.amount;
  }

  _createClass(Metadata, [{
    key: "format",
    value: function format() {
      return "{\n  \"721\": {\n    \"" + this.policy_id + "\": {\n      \"" + this.asset_id + "\": {\n        \"name\": \"" + this.asset_name + "\",\n        \"mediaType\": \"image/png\",\n        \"image\": \"" + this.ipfsLink + "\",\n        \"traits\": " + JSON.stringify(this.traits) + ",\n        \"amount\": \"" + this.amount + "\"\n      }\n    }\n  }\n}\n";
    }
  }]);

  return Metadata;
}();

exports.default = Metadata;