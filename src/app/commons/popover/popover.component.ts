import { Component, Input, OnInit } from '@angular/core';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss']
})
export class PopoverComponent implements OnInit {

  @Input() screenLangInfo: any;

  itinerary: any;

  selectedDate: any;

  reservation: any;

  selectedCabin: any;

  selectedCategoryRoom: string = 'Interior';

  urlConexion: any;

  urlShareConexion: any;

  sailDate: any;

  constructor(private userPreferences: UserPreferencesService) { }

  ngOnInit() {

    this.selectedDate = this.userPreferences.getElement("SelectedDate");
    this.itinerary = this.userPreferences.getElement("Itinerary");
    this.reservation = this.userPreferences.getElement("Reservation");
    this.selectedCabin = this.userPreferences.getElement("selectedCabin");

    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;

    this.urlConexion = this.userPreferences.getUrlConexion();
    this.urlShareConexion = this.userPreferences.getUrlShareConexion();

    this.BuildSailDate();

  }

  BuildTextData(): any {
    var result = '';

    result += this.screenLangInfo.lbl_SuCrucero + '\n';

    if(this.itinerary.nnoches == '1'){
        var noche = this.screenLangInfo.lbl_noche;
        this.screenLangInfo.lbl_nochesEnEl = noche;
      
      }

    if (this.itinerary) {
      result += this.screenLangInfo.lbl_CompanniaCompartir + ' ' + this.itinerary.companiaName + '\n';
      result += this.screenLangInfo.lbl_DestinoCompartir + ' ' + this.itinerary.destino + '\n';
      result += this.itinerary.nnoches + ' ' + this.screenLangInfo.lbl_nochesEnEl + ' '
        + this.itinerary.shipName + '\n';
    }

    if (this.selectedDate) {
      result += this.screenLangInfo.lbl_fecha + ' ' + this.selectedDate.dateOut.dia + ' ' + this.selectedDate.dateOut.mes
        + ' ' + this.selectedDate.dateOut.anno + '\n';
      result += this.screenLangInfo.lbl_Itinerario_SalidaDesde + ' ' + this.itinerary.puertoSalida + '\n';
      result += this.screenLangInfo.lbl_Visitando + ' ' + this.selectedDate.recorridoString + '\n';
    }

    result += this.screenLangInfo.lbl_Categoria + this.GetCatTranslate() + (this.selectedCabin ?
      '/ (' + this.screenLangInfo.lbl_CategoriaTipoCabina + ' ' + this.selectedCabin.categoria + ' )' : '') + '\n';

    if (this.reservation.rate)
    {
        result += this.screenLangInfo.lbl_tarifa + ' ' + this.reservation.rate.titulo + '\n';
        result += this.reservation.rate.descripcion + '\n';
    }

    result += this.screenLangInfo.lbl_PorPersonaDesde + '\n';

    result += this.screenLangInfo.lbl_Button_Interior + ' ' +
      (this.HaveValue(this.selectedDate.cabinasMasBaratas[0].precioCabinaPax.valorPrincipal)
        ? this.selectedDate.cabinasMasBaratas[0].precioCabinaPax.valorPrincipalString + ' ' +
        this.selectedDate.cabinasMasBaratas[0].precioCabinaPax.monedaP : this.screenLangInfo.lbl_CabinaNoDisponible) + '\n';

    result += this.screenLangInfo.lbl_Button_Exterior + ' ' +
      (this.HaveValue(this.selectedDate.cabinasMasBaratas[1].precioCabinaPax.valorPrincipal)
        ? this.selectedDate.cabinasMasBaratas[1].precioCabinaPax.valorPrincipalString + ' ' +
        this.selectedDate.cabinasMasBaratas[1].precioCabinaPax.monedaP : this.screenLangInfo.lbl_CabinaNoDisponible) + '\n';

    result += this.screenLangInfo.lbl_Button_Balcon + ' ' +
      (this.HaveValue(this.selectedDate.cabinasMasBaratas[2].precioCabinaPax.valorPrincipal)
        ? this.selectedDate.cabinasMasBaratas[2].precioCabinaPax.valorPrincipalString + ' ' +
        this.selectedDate.cabinasMasBaratas[2].precioCabinaPax.monedaP : this.screenLangInfo.lbl_CabinaNoDisponible) + '\n';

    result += this.screenLangInfo.lbl_Button_Suite + ' ' +
      (this.HaveValue(this.selectedDate.cabinasMasBaratas[3].precioCabinaPax.valorPrincipal)
        ? this.selectedDate.cabinasMasBaratas[3].precioCabinaPax.valorPrincipalString + ' ' +
        this.selectedDate.cabinasMasBaratas[3].precioCabinaPax.monedaP : this.screenLangInfo.lbl_CabinaNoDisponible) + '\n';

    result += this.screenLangInfo.lbl_ParaMasInfoVisite + '\n';
    result += this.GetUrlData();

    return encodeURIComponent(result);
  }

  GetCatTranslate(): any {

    if (this.selectedCategoryRoom == "Interior") {
      return this.screenLangInfo.lbl_Button_Interior;
    }
    else if (this.selectedCategoryRoom == "Exterior") {
      return this.screenLangInfo.lbl_Button_Exterior;
    }
    else if (this.selectedCategoryRoom == "Balcon") {
      return this.screenLangInfo.lbl_Button_Balcon;
    }
    else {
      return this.screenLangInfo.lbl_Button_Suite;
    }

  }

  HaveValue(value): any {
    return !(value == null || value === 0);
  }


  BuildMail(): any {
    return 'mailto:?Subject=' + this.screenLangInfo.lbl_SuCrucero + '&body=' + this.BuildTextData();
  }

  BuildWhatApp(): any {
    return 'https://wa.me/?text=' + this.BuildTextData();
  }

  BuildTwitter(): any {
    return 'https://twitter.com/intent/tweet?text=' + this.BuildTextData();
  }

  BuildFacebook(): any {
    return 'http://www.facebook.com/share.php?u=' + this.GetUrlData();
  }

  BuildInstagram(): any {
    return 'https://www.instagram.com/?url=' + this.GetUrlData();
  }

  GetUrlData(): any {
    // 'http://cb-test-agencias.istinfor.com/index2.html';
    return 'http://cb-test-agencias.istinfor.com/index2.html' + this.BuildRatesQueryParams();
  }

  BuildRatesQueryParams(): any {
    var result = '';

    if (this.itinerary != null) {
      result += 'IdItinerary=' + this.itinerary.itinerarioCode + '&';
    }

    if (this.selectedDate != null) {
      result += 'IdDate=' + this.selectedDate.idSalidas + '&';
    }

    if (this.selectedCategoryRoom != null) {
      result += 'categoryRoom=' + this.selectedCategoryRoom + '&';
    }

    if (this.sailDate != null) {
      result += 'sailDate=' + this.sailDate + '&';
    }
    if (this.itinerary != null && this.itinerary.company != null) {
      result += 'company=' + this.itinerary.company + '&';
    }

    if (this.urlConexion != null) {
      result += 'url=' + this.urlConexion + '&';
    }

    if (result.trim() != '') {
      result = '?' + result + 'SelectionRates=Y';
    }

    return result;
  }

  BuildSailDate() {

    if (this.selectedDate.fechaSalida) {
      var split: string[] = this.selectedDate.fechaSalida.substring(0, 10).split("-");

      this.sailDate = split[2] + "-" + split[1] + "-" + split[0];
    }
  }

  BuildBodyMail(): any {
    var result: string = '';
    result += `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body>
        <div style="background-color: #ebebeb; font-size: 18px; font-size: 1.2rem; color: #6c757d; font-weight: 500;" align="center">
            <table width="600" table-border="0" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;background: #e5e5e5;">
                <tr>
                    <td align="center">
                        <img [srcUrlImgLogoAgency]=[srcUrlImgLogoAgency] alt="Agency Logo"
                             style="box-sizing: border-box; border-style: none; vertical-align: middle;" width="100" height="50" />
                    </td>
                    <td align="center">
                        <img [srcUrlImgLogoCompany]=[srcUrlImgLogoCompany] alt="Company Logo"
                             style="box-sizing: border-box; border-style: none; vertical-align: top;" width="100" height="40" />
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <table width="600" table-border="0" border="0" cellpadding="0" cellspacing="15" style="margin: 0 auto;background: #ffffff;">
                            <tr>
                                <td colspan="4">
                                    <h4 style="box-sizing: border-box; margin-top: 0; line-height: 1.2; margin-bottom: .5rem; font-size: 1rem; color: #2a5c96; font-weight: 500;">
                                        [lbl_Title_NoPreuspuesto] <span style="font-weight: 500; line-height: 1; text-align: center; background-color: #2a5c96; margin-left: 20px; padding-right: 10px; padding-left: 10px; color: #fff;">[NoPresupuesto]</span>
                                    </h4>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4">
                                    <h4 style = "font-size: 18px; font-size: 1.2rem; color: #6c757d; font-weight: 500;">
                                        [lbl_Word_AgradecimientoSuperior]
                                    </h4>
                                    <h4 style="font-size: 18px; font-size: 1.2rem; color: #6c757d; font-weight: 500;">
                                        <div>
                                            <b>[lbl_Title_FechaPresupuesto]</b>
                                            [FechaActual]
                                        </div>
                                    </h4>
                                    <h4 style="font-size: 18px; font-size: 1.2rem; color: #6c757d; font-weight: 500;">
                                        [lbl_Word_NotaAclarativaEmailCotizacion]
                                    </h4>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4" style="border-bottom: 1px solid #dee2e6;">
                                    <h4 style="box-sizing: border-box; margin-top: 0; font-weight: 500; line-height: 1.2; margin-bottom: .5rem; font-size: 1.3rem; color: #2a5c96;">
                                        [lbl_Title_SalidaBlock]
                                    </h4>
                                </td>
                            </tr>
                            <tr>
                                <td width="25%" align="center">
                                    <img [srcUrlImgDestino]=[srcUrlImgDestino] alt="Img Destino" style="box-sizing: border-box; border-style: none; vertical-align: middle;" width="200" height="180" />
                                </td>
                                <td width="75%" colspan="3" style="padding-left: 20px; margin-top: 0; color: #6c757d;">
                                    <div>
                                        <b>[lbl_Title_Destino]</b>
                                        [Destino]
                                    </div>
                                    <div style="box-sizing: border-box; font-weight: 500;">
                                        <b>[lbl_Title_FechaSalida]</b>
                                        [FechaSalida]
                                    </div>
                                    <div style="box-sizing: border-box; ">
                                        <b> [lbl_Title_FechaLlegada]</b>
                                        [FechaLlegada]
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4" style="border-bottom: 1px solid #dee2e6;">
                                    <h3 style="box-sizing: border-box; margin-top: 0; font-weight: 500; line-height: 1.2; margin-bottom: .5rem; font-size: 1.3rem; color: #2a5c96;">
                                        [lbl_Title_BarcoBlock]
                                    </h3>
                                </td>
                            </tr>
                            <tr>
                                <td width="75%" colspan="3" style="padding-left: 20px; margin-top: 0; color: #6c757d;">
                                    <div style="box-sizing: border-box; font-weight: 500;">
                                        <b>[lbl_Title_NombreCompannia]:</b>
                                        [NombreCompania]
                                    </div>
                                    <div style="box-sizing: border-box; font-weight: 500;">
                                        <b>[lbl_Title_NombreBarco]</b>
                                        [NombreBarco]
                                    </div>
                                    <div style="box-sizing: border-box; font-weight: 500;">
                                        <b>[lbl_Title_Duracion]</b>
                                        [NoDiasDuracion] [lbl_Word_Dias]
                                    </div>
                                    <div style="box-sizing: border-box; font-weight: 500;">
                                        <b>[lbl_Title_Itinerario]</b>
                                        [Itinerario]
                                    </div>
                                </td>
                                <td width="25%" align="center">
                                    <img [srcUrlImgBarco]=[srcUrlImgBarco] alt="Img Barco" style="box-sizing: border-box; border-style: none; vertical-align: middle;" width="200" height="130" />
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4" style="border-bottom: 1px solid #dee2e6;">
                                    <h3 style="box-sizing: border-box; margin-top: 0; font-weight: 500; line-height: 1.2; margin-bottom: .5rem; font-size: 1.3rem; color: #2a5c96;">
                                        [lbl_Title_CabinaBlock]
                                    </h3>
                                </td>
                            </tr>
                            <tr>
                                <td width="25%" align="center">
                                    <img [srcUrlImgCubierta]=[srcUrlImgCubierta] alt="Img Cubierta" style="box-sizing: border-box; border-style: none; vertical-align: middle;" width="200" height="180" />
                                </td>
                                <td width="75%" colspan="3" style="margin-bottom: 2px; padding-left: 20px; margin-top: 0; color: #6c757d;">
                                    <div style="box-sizing: border-box; font-weight: 500;">
                                        <b>[lbl_Title_Categoria]</b> [Categoria]
                                    </div>
                                    <div style="box-sizing: border-box; font-weight: 500;">
                                        <b>[lbl_Title_Metacategoria]</b> [Metacategoria]
                                    </div>
                                    <div style="box-sizing: border-box; font-weight: 500;">
                                        <b>[lbl_Title_NoPax]</b> [NoPax]
                                    </div>
                                </td>
                            </tr>
                            <tr style="margin-top: 10px;">
                                <td width="100%" colspan="4">
                                    <div style="box-sizing: border-box; margin-top: 0; font-weight: 500; line-height: 1.2; margin-bottom: .5rem; font-size: 1.3rem; color: #2a5c96;">
                                        [lbl_Title_PaxDataBlock]
                                    </div>
                                    [BloquePaxData]
                                </td>
                            </tr>
                            <tr style="margin-top: 10px;">
                                <td width="100%" colspan="4">
                                    <div style="box-sizing: border-box; margin-top: 0; font-weight: 500; line-height: 1.2; margin-bottom: .5rem; font-size: 1.3rem; color: #2a5c96;">
                                        [lbl_Title_PrecioXPax]
                                    </div>
                                    [BlockCotizacion]
                                </td>
                            </tr>
                            <tr>
                                <td width="100%" colspan="4" style="color: #6c757d;">
                                    <h3 style="box-sizing: border-box; margin-top: 0; font-weight: 500; line-height: 1.2; margin-bottom: .5rem; font-size: 1.3rem; color: #2a5c96;">
                                        [lbl_titleNotasCotizacion]
                                    </h3>
                                    <p style="box-sizing: border-box; margin-top: 0; margin-bottom: 1.5rem; color: #6c757d;">
                                        [NotasCotizacion]
                                    </p>
                                    <p style="box-sizing: border-box; margin-bottom: 1rem; margin-top: 8px; color: #2a5c96;">
                                        [lbl_graciasPorEscogernos] <b style="box-sizing: border-box; font-weight: 500;">[TextNombreAgency]</b>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #eaebed; font-size: 12px; text-align: center;" valign="top" text-align="center">
                        <div>
                            <span style="color: #5a5b5e; font-size: 12px; text-align: center;"><strong>[lbl_Siguenos]</strong></span>
                        </div>
                        <div style="padding-top: 10px;"></div>
                        <div>
                            <a target="_blank" href="https://facebook.com/aaa"
                               style="text-decoration: none; margin: 0 5px 0 5px;">
                                <img style="vertical-align: middle; border-style: none; vertical-align: middle; border-style: none;" height="50px" width="50px" id="ImgLogoFacebook" [UrlImgLogoFacebook]=[UrlImgLogoFacebook] />
                            </a>
                            <a target="_blank" href="https://t.me/aaa"
                               style="text-decoration: none; margin: 0 5px 0 5px;">
                                <img style="vertical-align: middle; border-style: none; vertical-align: middle; border-style: none;" height="50px" width="50px" id="ImgLogoTwitter" [UrlImgLogoTwitter]=[UrlImgLogoTwitter] />
                            </a>
                            <a target="_blank" href="https://linkedin.com/aaa"
                               style="text-decoration: none; margin: 0 5px 0 5px;">
                                <img style="vertical-align: middle; border-style: none; vertical-align: middle; border-style: none;" height="50px" width="50px" id="ImgLogoLinkedIn" [UrlImgLogoLinkedIn]=[UrlImgLogoLinkedIn] />
                            </a>
                            <a target="_blank" href="https://instagram.com/aaa"
                               style="text-decoration: none; margin: 0 5px 0 5px;">
                                <img style="vertical-align: middle; border-style: none; vertical-align: middle; border-style: none;" height="50px" width="50px" id="ImgLogoInstagram" [UrlImgLogoInstagram]=[UrlImgLogoInstagram] />
                            </a>
                        </div>
                    </td>
                    <td style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #9a9ea6; font-size: 12px; text-align: center;" valign="top" text-align="center">
                        <div>
                            <img alt="Default" style="vertical-align: middle; border-style: none; border: 0px;" id="LinkImgLogoCompany" [UrlImgLogoAgencySmall]=[UrlImgLogoAgencySmall] width="null" height="32" />
                            <br />
                            <a style="color: #9a9ea6; font-size: 12px; text-align: center; text-decoration: none;">[TextNombreAgency]</a>
                            <br />
                            <span style="color: #5a5b5e; font-size: 12px; text-align: center;">[textDirAgency]</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #afb0b3; font-size: 12px; text-align: center;" valign="top" text-align="center">
                        <span style="color: #5a5b5e; font-size: 12px; text-align: center;" id="lblPoweredBy">[lblPoweredBy]</span>
                        <a [LinkUrlTecPatner]=[LinkUrlTecPatner] style="color: #9a9ea6; font-size: 12px; text-align: center; text-decoration: none;">[TextNameTecPatner]</a>.
                        <span style="color: #5a5b5e; font-size: 12px; text-align: center;" id="lblReservedRight">[lblReservedRight]</span>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>`;
    return result;
  }

}
