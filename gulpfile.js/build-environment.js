const colors = require('ansi-colors');

function buildEnvironment(params) {
    // `environment.prod.ts` file structure
    const envConfigData = `const url = 'http://cb-services-test.ingeniuscuba.com/languaje/CruiseSearcher/';
const principal = 'http://cb-services-test.ingeniuscuba.com/Principal/';
const urlBarcoItinerario = 'http://cb-services-test.ingeniuscuba.com/languaje/VerBarcoItinerario/';
const urlTarifaSelection = 'http://cb-services-test.ingeniuscuba.com/languaje/TarifaSelection/';
const resumen = 'http://cb-services-test.ingeniuscuba.com/Resumen/';
export const environment = {
        production: true,
        urls: {
                /* Principal */
                SignIn: principal,
                GetScreenSearchLocale: principal + 'GetScreenSearchLocale',
                GetScreenBarcoItinerarioLocale: principal + 'GetScreenBarcoItinerarioLocale',
                GetScreenPaxSelectionLocale: principal + 'GetScreenPaxSelectionLocale',
                GetScreenTarifaSelectionLocale: principal + 'GetScreenTarifaSelectionLocale',
                GetScreenPaxDataLocale: principal + 'GetScreenPaxDataLocale',
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
                GetCabinasXSalidas: urlTarifaSelection + 'GetCabinasXSalidas',
                LoadXMLShipCabinMap: urlTarifaSelection + 'LoadXMLShipCabinMap',
                GetListTarifasBR: urlTarifaSelection + 'GetListTarifasBR',
                GetListTarifasPSZ: urlTarifaSelection + 'GetListTarifasPSZ',
                GetCabinasXTarifas: urlTarifaSelection + 'GetCabinasXTarifas',

                /* Resumen */
                GetImagenBarco: resumen + 'GetImagenBarco',
                GetImagenDesgolse: resumen + 'GetImagenDesgolse',
                GetResumenCotizacion: resumen + 'GetResumenCotizacion',
                SendResumenEmails: resumen + 'SendResumenEmails',
                RegistrarCotizacion: resumen + 'RegistrarCotizacion',
                NotificarCotizacion: resumen + 'NotificarCotizacion',
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
`;
    console.log(colors.magenta(`The file ${params.productionMode ? 'environment.prod.ts' : 'environment.ts'} will be written with the following content:`));
    console.log(colors.grey('CruiseBrowser API base: ' + params.CruiseBrowserBase));

    return envConfigData
}

module.exports = buildEnvironment