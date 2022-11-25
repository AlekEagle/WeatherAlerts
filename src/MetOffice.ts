import Parser = require("../node_modules/rss-parser/index");

import { MetOfficeAlert } from "./WeatherAlert";

const parser = new Parser();

// Create the object that will have the functions that will be exported
const MetOffice = {};

export default async function (region: string) {
  const feed = await parser.parseURL(
    `https://www.metoffice.gov.uk/public/data/PWSCache/WarningsRSS/Region/${region}.xml`
  );

  const activeAlerts: any[] = [];

  feed.items.forEach((item) => {
    let severity = "Unknown";
    if (item.title.includes("Yellow")) {
      severity = "Yellow";
    } else if (item.title.includes("Amber")) {
      severity = "Amber";
    } else if (item.title.includes("Red")) {
      severity = "Red";
    }

    // Get what the alert is for
    let alert = item.title.substring(
      item.title.indexOf("of") + 3,
      item.title.indexOf("affecting")
    );
    // Remove any trailing whitespace
    alert = alert.trim();
    // Capitalise each word
    alert = alert
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Get the region the alert is for
    let affRegion = item.title.substring(item.title.indexOf("affecting") + 10);

    // Then list the counties
    let counties = item.content.substring(
      item.content.indexOf("affecting") + 10,
      item.content.indexOf("valid from")
    );

    // Remove the passed region from the region string
    affRegion = affRegion.replace(region, "");

    // And capitalise.
    affRegion = affRegion
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    counties = counties
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Get the start date by searching the area from "valid from" to "to"
    let start_date = item.content.substring(
      item.title.indexOf("valid from") + 11,
      item.content.indexOf(" to ")
    );
    // Remove "from" from the start date
    start_date = start_date.substring(start_date.indexOf("from") + 5);
    // Add a colon to the start date 2 characters in
    start_date = start_date.substring(0, 2) + ":" + start_date.substring(2);

    // Get the end date by grabbing the last 15 characters
    let end_date = item.content.substring(item.content.length - 15);
    // Add a colon to the end date 2 characters in
    end_date = end_date.substring(0, 2) + ":" + end_date.substring(2);

    // Create the alert object
    const alertObj: MetOfficeAlert = {
      severity: severity,
      alert: alert,
      region: affRegion,
      counties: counties,
      start_date: start_date,
      end_date: end_date,
      link: item.link,
    };
    activeAlerts.push(alertObj);
  });

  // First, check if theres any alerts that are duplicate by alert, severity and start time.
  // If there is, combine them into one alert, and remove the duplicate.
  for (let i = 0; i < activeAlerts.length; i++) {
    for (let j = i + 1; j < activeAlerts.length; j++) {
      if (
        activeAlerts[i].alert == activeAlerts[j].alert &&
        activeAlerts[i].severity == activeAlerts[j].severity &&
        activeAlerts[i].start_date == activeAlerts[j].start_date
      ) {
        // Combine the counties
        activeAlerts[i].counties += ", " + activeAlerts[j].counties;
        // Remove the duplicate
        activeAlerts.splice(j, 1);
      }
    }
  }

  // If an alert has an end date that starts with 23:59 of another alert that starts the next day at 00:00, merge them.
  for (let i = 0; i < activeAlerts.length; i++) {
    for (let j = 0; j < activeAlerts.length; j++) {
      if (i !== j) {
        if (
          activeAlerts[i].end_date.startsWith("23:59") &&
          activeAlerts[j].start_date.startsWith("00:00") &&
          activeAlerts[i].alert === activeAlerts[j].alert &&
          activeAlerts[i].severity === activeAlerts[j].severity
        ) {
          activeAlerts[i].end_date = activeAlerts[j].end_date;
          activeAlerts.splice(j, 1);
        }
      }
      // Then the same if the alert is 22:59 and the next alert is 23:00.
      if (i !== j) {
        if (
          activeAlerts[i].end_date.startsWith("22:59") &&
          activeAlerts[j].start_date.startsWith("23:00") &&
          activeAlerts[i].alert === activeAlerts[j].alert &&
          activeAlerts[i].severity === activeAlerts[j].severity
        ) {
          activeAlerts[i].end_date = activeAlerts[j].end_date;
          activeAlerts.splice(j, 1);
        }
      }
    }
  }

  // Final touch - if there is more than one region or county, use "and" instead of the last comma.
  for (let i = 0; i < activeAlerts.length; i++) {
    if (activeAlerts[i].region.includes(",")) {
      activeAlerts[i].region = activeAlerts[i].region.replace(
        /,(?=[^,]*$)/,
        " and"
      );
    }
    if (activeAlerts[i].counties.includes(",")) {
      activeAlerts[i].counties = activeAlerts[i].counties.replace(
        /,(?=[^,]*$)/,
        " and"
      );
    }
  }

  return activeAlerts;
}
