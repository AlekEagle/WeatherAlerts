const Parser = require("rss-parser");
const parser = new Parser();

var request = require("request");
var convert = require("xml-js");

import { MetServiceAlert } from "./WeatherAlert";

export default async function () {
  const feed = await parser.parseURL("https://alerts.metservice.com/cap/rss");
  const alerts: any[] = [];

  feed.items.forEach(async (item: any) => {
    // To whoever in the Met Service decided that the further links aren't parsable with a RSS Feed - I hate you.
    // I hate you so much.
    // I hate you so much that I'm going to have to use a HTTP request to get the data.
    const issueDate = new Date(item.isoDate);

    request(item.link, function (error: any, response: any, body: any) {
      let result = JSON.parse(convert.xml2json(body, { compact: false }));
      var res = result.elements[0].elements.map(({ name, elements }: any) => ({
        name,
        elements,
      }));
      // Then get the info elements using filter
      var info = res.filter(({ name }: any) => name === "info")[0].elements;
      // AND THEN grab every element in the info array and map it to an object. Like so: {name: elements[0].text}
      var infoObj = info
        .map(({ name, elements }: any) => ({ name, elements }))
        .reduce(
          (acc: any, { name, elements }: any) => ({
            ...acc,
            [name]: elements[0].text,
          }),
          {}
        ); // I'm gonna be honest, I have no idea how the fuck copilot did this, but it works. Thanks copilot <3
      // BUT I'M NOT DONE YET! Now we have to get the area and color elements using filter, and then map them to an object.
      var area = info.filter(({ name }: any) => name === "area")[0].elements[0]
        .elements[0].text;
      // And now the color. Except its more awkward than area because of course it is.
      // Since its in a parameter element, and theres two other parameter elements, we have to grab all of them and pray the color is the last one.
      var color = info.filter(({ name }: any) => name === "parameter")[2]
        .elements[1].elements[0].text;
      // After several hours of screaming, crying and frankly, just giving up, I have finally finished this.

      const alertObj: MetServiceAlert = {
        severity: infoObj.severity,
        color: color,
        area: area,
        description: infoObj.description,
        instruction: infoObj.instruction,
        headline: infoObj.headline,
        alert: infoObj.event,
        region: "New Zealand",
        start_date: infoObj.onset,
        end_date: infoObj.expires,
        link: item.link,
        responseType: infoObj.responseType,
        certainty: infoObj.certainty,
        urgency: infoObj.urgency,
        issueDate: issueDate,
      };

      alerts.push(alertObj);
    });
  });

  return alerts;
}
