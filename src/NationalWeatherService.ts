const Parser = require("rss-parser");
const parser = new Parser({
  // This is required to grab the data prefixed with "cap:"
  customFields: {
    item: [
      ["cap:event", "alert"],
      ["cap:effective", "start_date"],
      ["cap:expires", "end_date"],
      ["cap:areaDesc", "region"],
      ["cap:severity", "severity"],
      ["cap:urgency", "urgency"],
      ["cap:certainty", "certainty"],
      ["cap:status", "status"],
      ["cap:msgType", "msgType"],
    ],
  },
});

import { NWSAlert } from "./WeatherAlert";

export default async function (region: any) {
  // As the NWS has a list for National, then State, then County, we cannot check if the region is valid.
  // Instead, we will just catch the error if it is invalid.
  try {
    const feed = await parser.parseURL(
      `https://alerts.weather.gov/cap/${region}.php?x=1`
    );
    const alerts: any[] = [];
    feed.items.forEach((item: any) => {
      // After reading the docs, I managed to grab all the missing data from the feed.
      let alert = item.alert;

      // Grab the regions by splitting the region string by semi-colons.
      let regions = item.region.split(";");

      const alertObj: NWSAlert = {
        severity: item.severity,
        alert: alert,
        region: regions,
        start_date: item.start_date,
        end_date: item.end_date,
        link: item.link,
        description: item.summary,
        issueDate: new Date(item.pubDate),
        urgency: item.urgency,
        certainty: item.certainty,
        status: item.status,
        msgType: item.msgType,
        author: item.author,
      };
      //console.log(item)

      alerts.push(alertObj);
    });
    return alerts;
  } catch (err) {
    console.log(err);
    throw new Error(
      "Invalid region provided. Please check the region and try again. For a list of regions, see https://alerts.weather.gov/ and click on the ATOM link."
    );
  }
}
