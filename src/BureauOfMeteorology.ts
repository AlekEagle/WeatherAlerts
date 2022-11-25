// So, for anyone who is searching on Google for why BoM's feed 403s and how to fix it, here's the answer.
// BoM basically got a massive budget cut sometime between 2010 and 2020, and they decided to cut the budget for their website and their feed.
// They eventually banned web scraping, and now they 403 you if you try to access their feed.
// So, to fix this, you have to use ``https://reg.bom.gov.au/`` instead of ``https://www.bom.gov.au/``.
// I'm not sure if this is a permanent fix, but it works for now.
// Kudos to everyone on the forum link below for figuring this out.
// https://forums.whirlpool.net.au/archive/3jww2w69

// I'll leave my attempts in comments below if this ever breaks again.
import Parser from "rss-parser";
import { BaseAlert } from ".";
const parser = new Parser({
  // headers: {
  //     "User-Agent": "UniversalFeedParser/3.3 +http://feedparser.org/", // I know this isn't ethical or whatever, but it's literally the only way to get the feed to work.,
  //     "Host": "www.bom.gov.au",
  //     "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  //     "Connection": "keep-alive",
  //     "Cache-Control": "no-cache",
  //     "Content-Type": "application/xml",
  //     "Accept-Encoding": "gzip, deflate",
  //     "Accept-Language": "en-GB,en;q=0.9,es-ES;q=0.8,es;q=0.7,en-US;q=0.6",
  //     "DNT": "1",
  //     "Upgrade-Insecure-Requests": "1"
  // },
  // defaultRSS: 1.0,
});

export default async function (
  state: "vic" | "nsw" | "qld" | "sa" | "wa" | "tas" | "nt" | "act"
): Promise<BaseAlert[]> {
  // Because the BoM has a weird way of doing things, we need to prefix the state with an id, then .warnings_, then the state again.
  // List of states and their ids:
  // NSW & ACT: 00054
  // VIC: 00059
  // QLD: 00056
  // WA: 00060
  // SA: 00057
  // TAS: 00058
  // NT: 00055

  let id = "";
  switch (state) {
    case "vic":
      id = "00059";
      break;
    case "nsw":
    case "act":
      id = "00054";
      break;
    case "qld":
      id = "00056";
      break;
    case "wa":
      id = "00060";
      break;
    case "sa":
      id = "00057";
      break;
    case "tas":
      id = "00058";
      break;
    case "nt":
      id = "00055";
      break;
    default:
      throw new Error("Invalid state");
  }

  // Also if the state is ACT, we need to change the state to NSW.
  if (state === "act") state = "nsw";

  const feed = await parser.parseURL(
    `https://reg.bom.gov.au/fwo/IDZ${id}.warnings_${state}.xml`
  );
  return feed.items.map((item) => {
    let title = item.title;
    if (!title) throw new Error("The BoM feed is broken");
    // Gotta admit, BoM's feed is worse than MetService's. It's missing a lot of data. But this time I can't do much about it.
    // Also its 2022 and you're a government agency and you don't support HTTPS? What the hell is wrong with you?
    // Pretty much all of the data is in the title, so we need to parse it, thanks BoM.
    // The title is in the format of:
    // <Time issued> [Severity] <Type> for <Location>
    // We don't need the time issued, because it's already in the pubDate. its formatted as:
    // <Day>/<24 hour time>:<Minute> <Timezone>
    // So we'll get rid of the time issued.
    title = title.replace(/^[0-9]{2}\/[0-9]{2}:[0-9]{2} [A-Z]{3} /, "");
    // Now we need to get the severity, type, and location.
    // The severity is either "Minor", "Moderate", "Severe", "Final", or it's not there.
    // If it's not there, we'll default to "Minor".
    let severity: string;
    if (
      title.startsWith("Minor") ||
      title.startsWith("Moderate") ||
      title.startsWith("Severe") ||
      title.startsWith("Final")
    ) {
      severity = title.split(" ")[0];
      title = title.replace(/^[A-Za-z]+ /, "");
    }

    // Now let's get the type for the alert, and the location.
    let [type, location] = title.split(" for ");
    // Finally, construct and push the alert.
    return {
      severity,
      alert: type,
      region: location,
      link: item.link,
      start: new Date(item.pubDate),
      end: new Date(item.pubDate),
    };
  });
}
