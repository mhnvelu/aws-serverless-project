"use strict";

const app = require("../../app.js");
const chai = require("chai");
const expect = chai.expect;
const nock = require("nock");
// nock.disableNetConnect();
var event, context;

describe("Tests IP", function () {
  it("verifies successful response", async () => {    
  
    const scope =  nock("http://checkip.amazonaws.com").get("/").reply(200, "1.1.1.1");

    const result = await app.lambdaHandler(event, context);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);
    expect(result.body).to.be.an("string");

    let response = JSON.parse(result.body);

    expect(response).to.be.an("object");
    expect(response.message).to.be.equal("Your IP is " + "1.1.1.1");
    scope.done();
  });
});
