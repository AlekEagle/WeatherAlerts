import BureauOfMeteorology from "./BureauOfMeteorology";
import EnviromentCanada from "./EnviromentCanada";
import MetOffice from "./MetOffice";
import MetService from "./MetService";
import MeteoAlarm from "./MeteoAlarm";
import NationalWeatherService from "./NationalWeatherService";

export interface BaseAlert {
  severity?: string;
  alert: string;
  region: string;
  start: Date;
  end: Date;
  link: string;
}

export default {
  BureauOfMeteorology,
  EnviromentCanada,
  MetOffice,
  MetService,
  MeteoAlarm,
  NationalWeatherService,
  BOM: BureauOfMeteorology,
  MA: MeteoAlarm,
  MO: MetOffice,
  MS: MetService,
  NWS: NationalWeatherService,
  Australia: BureauOfMeteorology,
  Europe: MeteoAlarm,
  UK: MetOffice,
  NewZealand: MetService,
  US: NationalWeatherService,
};
