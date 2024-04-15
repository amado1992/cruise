import { URLS } from '../assets/config';

//Modo produccion
/*const url = 'http://cb-services-test.ingeniuscuba.com/languaje/CruiseSearcher/';
const principal = 'http://cb-services-test.ingeniuscuba.com/Principal/';
const urlBarcoItinerario = 'http://cb-services-test.ingeniuscuba.com/languaje/VerBarcoItinerario/';
const urlTarifaSelection = 'http://cb-services-test.ingeniuscuba.com/languaje/TarifaSelection/';
const resumen = 'http://cb-services-test.ingeniuscuba.com/Resumen/';*/


//Modo desarrolllo
/*const url = 'http://sandboxcb3-services.ingeniuscuba.com/languaje/CruiseSearcher/';
const principal = 'http://sandboxcb3-services.ingeniuscuba.com/Principal/';
const urlBarcoItinerario = 'http://sandboxcb3-services.ingeniuscuba.com/languaje/VerBarcoItinerario/';
const urlTarifaSelection = 'http://sandboxcb3-services.ingeniuscuba.com/languaje/TarifaSelection/';
const resumen = 'http://sandboxcb3-services.ingeniuscuba.com/Resumen/';*/



/*const url = 'http://cb30-services.istinfor.com/languaje/CruiseSearcher/';
const principal = 'http://cb30-services.istinfor.com/Principal/';
const urlBarcoItinerario = 'http://cb30-services.istinfor.com/languaje/VerBarcoItinerario/';
const urlTarifaSelection = 'http://cb30-services.istinfor.com/languaje/TarifaSelection/';
const resumen = 'http://cb30-services.istinfor.com/Resumen/';
*/

let url = URLS.url
let principal = URLS.principal
let urlBarcoItinerario = URLS.urlBarcoItinerario
let urlTarifaSelection = URLS.urlTarifaSelection
let resumen = URLS.resumen

export const environment = {
  production: true,
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
    //GetCabinasXSalidas: urlTarifaSelection + 'GetCabinasXSalidas',
    GetCabinasXSalidas: urlTarifaSelection + 'GetCategoriasXSalidas',
    VerCabinasXCategorias: urlTarifaSelection + 'GetCabinasXCategorias',
    LoadXMLShipCabinMap: urlTarifaSelection + 'LoadXMLShipCabinMap',
    GetListTarifasBR: urlTarifaSelection + 'GetListTarifasBR',
    GetListTarifasPSZ: urlTarifaSelection + 'GetListTarifasPSZ',
    //GetCabinasXTarifas: urlTarifaSelection + 'GetCabinasXTarifas',
    GetCabinasXTarifas: urlTarifaSelection + 'GetCategoriasXTarifas',
    GetScreenCabinaSelection: principal + 'GetScreenCabinaSelection',
    GetScreenCabinaNumberSelection: principal + 'GetScreenCabinaNumberSelection', 
    setHoldCabina: urlTarifaSelection + 'setHoldCabina',
    GetBloqueTarifas: urlTarifaSelection + 'GetlistTarifas',
    getTurnosComidaOnline: urlTarifaSelection + 'GetTurnosComidaOnline',
    GetPreDataTarifas: urlTarifaSelection + 'GetFlowConditions',
    GetComboGateway: urlTarifaSelection + 'GetComboGateway',//Nueva url

    /* Resumen */
    GetImagenBarco: resumen + 'GetImagenBarco',
    GetImagenDesgolse: resumen + 'GetImagenDesgolse',
    GetResumenCotizacion: resumen + 'GetResumenCotizacion',
    SendResumenEmails: resumen + 'SendResumenEmails',
    GetPrintVersionCotizacion: resumen + 'GetPrintVersionCotizacion',
    SendEmailClient: resumen + 'SendEmailClient',
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
