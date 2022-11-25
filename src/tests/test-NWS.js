// Test File

// Require the NWS
const NWS = require("../lib/NationalWeatherService.js");

// Print out the current alerts for the US
// Needs to be in a function to use await
async function test() {
    const alerts = await NWS.getAlerts("AK");
    console.log(alerts);
}

// Run the test
test();