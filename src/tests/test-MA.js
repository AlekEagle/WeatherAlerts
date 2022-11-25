// its midnight i have lost my mind my will to live and my will to code
// however the show must go on

const MeteoAlarm = require("../lib/MeteoAlarm.js");

// Print out the current alerts for Belgium
// Needs to be in a function to use await
async function test() {
    const alerts = await MeteoAlarm.getAlerts("Ireland");
    console.log(alerts);
}

// Run the test
test();
