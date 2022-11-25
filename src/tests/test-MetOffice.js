// Test File

// Require the MetOffice
var MetOffice = require("../lib/MetOffice.js");

// Print out the current alerts for the UK
// Needs to be in a function to use await
async function test() {
    const alerts = await MetOffice.getAlerts("UK");
    console.log(alerts);
}

// Run the test
test();
