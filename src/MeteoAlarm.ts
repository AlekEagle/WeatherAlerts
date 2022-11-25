// Handles all EU member states.
// Doesn't mean my sanity is intact.
import Parser from "rss-parser";
import { BaseAlert } from ".";
const parser = new Parser({
  customFields: {
    item: [["description", "description"]],
  },
  headers: {
    Accept: "*/*",
  },
});

export interface MeteoAlarmAlert extends BaseAlert {
  description: string;
  raw: string;
  published: Date;
}

export enum MeteoAlarmLevel {
  GREEN = 1,
  YELLOW = 2,
  AMBER = 3,
  RED = 4,
}

export enum MeteoAlarmType {
  WIND = 1,
  SNOW_ICE = 2,
  THUNDERSTORM = 3,
  FOG = 4,
  EXCESSIVE_HEAT = 5,
  LOW_TEMPERATURE = 6,
  COASTAL_EVENT = 7,
  FOREST_FIRE = 8,
  AVALANCHE = 9,
  RAIN = 10,
  FLOOD = 11,
  FLASH_FLOOD = 12,
  RAIN_FLOOD = 13,
}

export default async function (country?: string): Promise<MeteoAlarmAlert[]> {
  const feed = await parser.parseURL(
    `https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-rss-europe`
  );
  return feed.items
    .map((item) => {
      // Check if the user has specified a country.
      if (country) {
        // If they have, check if the country is in the title, if it isn't, return null, we'll filter it out later.
        if (!item.title.toLowerCase().includes(country.toLowerCase())) return;
      }
      // If the user hasn't specified a country, or the country is in the title, continue.
      // The description has a majority of the information we need, but its HTML enclosed in a CDATA tag, so we need to remove that.
      let description = item.description
        .replace("<![CDATA[", "")
        .replace("]]>", "");
      // The description is structured like this (we're omitting unnecessary HTML attributes):
      // <table>
      //   <tr>
      //     <th>Today</th>
      //   </tr>
      //   <tr>
      //     <td>
      //       <img alt="awt:<AlertType> level:<AlertLevel>" />
      //     </td>
      //     <td>
      //       <b>From: </b>
      //       <i><StartDate></i>
      //       <b>Until: </b>
      //       <i><EndDate></i>
      //     </td>
      //   </tr>
      //   <tr>
      //     <th>Tomorrow</th>
      //   </tr>
      // </table>
    })
    .filter((item) => item !== null) as unknown as MeteoAlarmAlert[];
}
