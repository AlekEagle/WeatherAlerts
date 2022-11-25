// screaming at the top of my lungs

const BOM = require("../lib/BureauofMeteorology.js");

async function test() {
    const alerts = await BOM.getAlerts("NSW");
    console.log(alerts);
}

test();