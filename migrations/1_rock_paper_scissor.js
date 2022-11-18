const RockPaperScissor = artifacts.require("RockPaperScissor");

module.exports = async function (deployer) {
    await deployer.deploy(RockPaperScissor);
    const contact = await RockPaperScissor.deployed();

    console.log("RockPaperScissor --> ", contact.address);
};

