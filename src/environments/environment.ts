import { URLS } from '../assets/config';
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.

/*const url = 'http://localhost:5001/languaje/CruiseSearcher/';
const principal = 'http://localhost:5001/Principal/';
const urlBarcoItinerario = 'http://localhost:5001/languaje/VerBarcoItinerario/';
const urlTarifaSelection = 'http://localhost:5001/languaje/TarifaSelection/';
const resumen = 'http://localhost:5001/Resumen/';
*/

/*const url = 'http://sandboxcb3-services.ingeniuscuba.com/languaje/CruiseSearcher/';
const principal = 'http://sandboxcb3-services.ingeniuscuba.com/Principal/';
const urlBarcoItinerario = 'http://sandboxcb3-servicesingeniuscuba.com/languaje/VerBarcoItinerario/';
const urlTarifaSelection = 'http://sandboxcb3-services.ingeniuscuba.com/languaje/TarifaSelection/';
const resumen = 'http://sandboxcb3-services.ingeniuscuba.com/Resumen/';*/


/*const url = 'http://cb30-services.istinfor.com/languaje/CruiseSearcher/';
const principal = 'http://cb30-services.istinfor.com/Principal/';
const urlBarcoItinerario = 'http://cb30-services.istinfor.com/languaje/VerBarcoItinerario/';
const urlTarifaSelection = 'http://cb30-services.istinfor.com/languaje/TarifaSelection/';
const resumen = 'http://cb30-services.istinfor.com/Resumen/';
*/

//Modo produccion
/*
const url = 'http://cb-services-test.ingeniuscuba.com/languaje/CruiseSearcher/';
const principal = 'http://cb-services-test.ingeniuscuba.com/Principal/';
const urlBarcoItinerario = 'http://cb-services-test.ingeniuscuba.com/languaje/VerBarcoItinerario/';
const urlTarifaSelection = 'http://cb-services-test.ingeniuscuba.com/languaje/TarifaSelection/';
const resumen = 'http://cb-services-test.ingeniuscuba.com/Resumen/';*/

//Modo desarrollo
/*const url = 'http://sandboxcb3-services.ingeniuscuba.com/languaje/CruiseSearcher/';
const principal = 'http://sandboxcb3-services.ingeniuscuba.com/Principal/';
const urlBarcoItinerario = 'http://sandboxcb3-services.ingeniuscuba.com/languaje/VerBarcoItinerario/';
const urlTarifaSelection = 'http://sandboxcb3-services.ingeniuscuba.com/languaje/TarifaSelection/';
const resumen = 'http://sandboxcb3-services.ingeniuscuba.com/Resumen/';*/


/*const url = URLS.url
const principal = URLS.principal
const urlBarcoItinerario = URLS.urlBarcoItinerario
const urlTarifaSelection = URLS.urlTarifaSelection
const resumen = URLS.resumen*/

let url = URLS.url
let principal = URLS.principal
let urlBarcoItinerario = URLS.urlBarcoItinerario
let urlTarifaSelection = URLS.urlTarifaSelection
let resumen = URLS.resumen

export const environment = {
  production: false,
  urls: {
    /* Principal */
    SignIn: principal,
    GetScreenSearchLocale: principal + 'GetScreenSearchLocale',
    GetScreenCallCenter: principal + 'GetScreenCallCenter',
    GetScreenBarcoItinerarioLocale: principal + 'GetScreenBarcoItinerarioLocale',
    GetScreenPaxSelectionLocale: principal + 'GetScreenPaxSelectionLocale',
    GetScreenTarifaSelectionLocale: principal + 'GetScreenTarifaSelectionLocale',
    GetScreenPaxDataLocale: principal + 'GetScreenPaxDataLocale',
    GetScreenValidationLocale: principal + 'GetScreenValidationLocale',
    GetScreenCotizationSelectionLocale: principal + 'GetScreenCotizacionSelection',
    GetScreenResumenCotizacionLocale: principal + 'GetScreenResumenCotizacionLocale',
    GetListCountry: principal + 'GetListCountry',
    GetScreenCabinaSelection: principal + 'GetScreenCabinaSelection',
    GetScreenCabinaNumberSelection: principal + 'GetScreenCabinaNumberSelection',
    GetMercadoAgenciaActivos: principal + 'GetMercadoAgenciaActivos',
    GetErrorMessage: principal + 'GetErrorMessage',
    SignInWidget: principal + 'SignInWidget',

    /* CruiseSearcher */
    ItineraryCount: url,
    GetFullSearchData: url + 'GetFullSearchData',
    GetListItinerario: url + 'GetListItinerario',
    GetSalidasXItinerario: url + 'GetSalidasXItinerario',
    GetOfertasActivas: url + 'GetOfertasActivas',
    GetCabinaMasBarataPosition: url + 'GetCabinaMasBarataPosition',
    GetItinerarioById: url + 'GetItinerarioById',

    /* VerBarcoItinerario */
    GetImagenesVerBarco: urlBarcoItinerario + 'GetImagenesVerBarco',

    /*TarifaSelection */
    /* GetCabinasXSalidas: urlTarifaSelection + 'GetCabinasXSalidas',
     LoadXMLShipCabinMap: urlTarifaSelection + 'LoadXMLShipCabinMap',
     GetListTarifasBR: urlTarifaSelection + 'GetListTarifasBR',
     GetListTarifasPSZ: urlTarifaSelection + 'GetListTarifasPSZ',
     GetCabinasXTarifas: urlTarifaSelection + 'GetCabinasXTarifas',*/


 //GetCabinasXSalidas: urlTarifaSelection + 'GetCabinasXSalidas',
 GetCabinasXSalidas: urlTarifaSelection + 'GetCategoriasXSalidas',
 VerCabinasXCategorias: urlTarifaSelection + 'GetCabinasXCategorias',
 LoadXMLShipCabinMap: urlTarifaSelection + 'LoadXMLShipCabinMap',
 GetListTarifasBR: urlTarifaSelection + 'GetListTarifasBR',
 GetListTarifasPSZ: urlTarifaSelection + 'GetListTarifasPSZ',
 GetBloqueTarifas: urlTarifaSelection + 'GetlistTarifas',
 //GetCabinasXTarifas: urlTarifaSelection + 'GetCabinasXTarifas',
 GetCabinasXTarifas: urlTarifaSelection + 'GetCategoriasXTarifas',
 setHoldCabina: urlTarifaSelection + 'setHoldCabina',
 getTurnosComidaOnline: urlTarifaSelection + 'GetTurnosComidaOnline',
 GetPreDataTarifas: urlTarifaSelection + 'GetFlowConditions',
 GetComboGateway: urlTarifaSelection + 'GetComboGateway',//Nueva url


    /* Resumen */
    GetImagenBarco: resumen + 'GetImagenBarco',
    GetImagenDesgolse: resumen + 'GetImagenDesgolse',
    GetResumenCotizacion: resumen + 'GetResumenCotizacion',
    SendResumenEmails: resumen + 'SendResumenEmails',
    SendEmailClient: resumen + 'SendEmailClient',
    GetPrintVersionCotizacion: resumen + 'GetPrintVersionCotizacion',
    SendEmailSupport: resumen + 'SendEmailSupport',
    RegistrarCotizacion: resumen + 'RegistrarCotizacion',
    NotificarCotizacion: resumen + 'NotificarCotizacion',
    getReservaOnline: resumen + 'GetReservaOnline',
  },
  originName: 'CruiseBrowser_APP',
  cacheableResources: [
    // principal + 'GetScreenSearchLocale',
    // principal + 'GetScreenBarcoItinerarioLocale',
    // principal + 'GetScreenPaxSelectionLocale',
    // principal + 'GetScreenTarifaSelectionLocale',
    // principal + 'GetScreenPaxDataLocale',
    // principal + 'GetScreenResumenCotizacionLocale',
    // principal + 'GetListCountry',
  ]
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
