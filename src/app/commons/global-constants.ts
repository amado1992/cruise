export class GlobalConstants {

    //passenger-data.component
//Etiqueta del server => Mensaje del angular
public static Err_msg_FormatoEmailIncorrecto = "Err_msg_FormatoEmailIncorrecto" //El correo no tiene un formato valido.
public static Err_msg_DatosPaxIncompletos = "Err_msg_DatosPaxIncompletos" //Campos obligatorios no especificados
public static PaxPhoneIcorrectFormat = "PaxPhoneIcorrectFormat"  //El telefono del pasajero "+String(i + 1)+" no es correcto
public static PaxFNacIcorrectFormat = "PaxFNacIcorrectFormat" //La fecha de pasajero "+String(i + 1)+" no es correcta
public static AgentPhoneIcorrectFormat = "AgentPhoneIcorrectFormat"// El telefono del agente no es correcto
public static AgentMissingData = "AgentMissingData"// Faltan datos del agente de viajes
public static PaxLastNameWithoutNumber = "PaxLastNameWithoutNumber"//Apellido del pasajero "+String(i)+ " debe contener palabras con letras solamente
public static PaxNameWithoutNumber = "PaxNameWithoutNumber"//Nombre del pasajero "+String(i)+ " debe contener palabras con letras solamente
public static Pax1CorreoObligatorio = "Pax1CorreoObligatorio" //Correo del primer pasajero no puede ser nulo

//CallCenter
public static CallCenterErrorGeneral = "CallCenterErrorGeneral" //Rectifique no haya numeros en nombre, el telefono este en formato solicitado y el correo este correcto.

public static ErrPaxAllChild = "ErrPaxAllChild" 
}