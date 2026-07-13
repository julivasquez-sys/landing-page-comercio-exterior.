/**
 * ==========================================================================
 * GOOGLE APPS SCRIPT - CONEXIÓN CON FORMULARIO DUOC UC (4 CAMPOS)
 * ==========================================================================
 * 
 * Este archivo contiene la lógica necesaria para recibir los datos de la
 * Landing Page y guardarlos automáticamente en una hoja de cálculo.
 * 
 * INSTRUCCIONES DE USO:
 * 1. Crea una hoja de cálculo nueva en Google Drive.
 * 2. En la primera fila (Fila 1), ingresa las siguientes cabeceras exactamente:
 *    A1: Fecha
 *    B1: Nombre
 *    C1: RUT
 *    D1: Correo
 *    E1: Liceo
 * 3. En el menú superior de la hoja, ve a: Extensiones > Apps Script.
 * 4. Pega todo el contenido de este archivo en el editor de Apps Script (reemplaza cualquier código existente).
 * 5. Guarda el proyecto de script haciendo clic en el icono del disco (Guardar).
 * 6. Haz clic en "Implementar" (botón azul en la esquina superior derecha) y selecciona "Nueva implementación".
 * 7. En "Seleccionar tipo", haz clic en el engranaje y selecciona "Aplicación web".
 * 8. Configura los siguientes parámetros:
 *    - Descripción: Registro de Prospectos Duoc UC
 *    - Ejecutar como: Tú (tu correo electrónico de Google)
 *    - Quién tiene acceso: Cualquiera (esto es crucial para permitir peticiones AJAX desde la web)
 * 9. Haz clic en "Implementar". Es posible que Google te solicite autorizar permisos. Haz clic en "Autorizar acceso" y acepta.
 * 10. Copia la "URL de la aplicación web" que termina en "/exec" y pégala en la variable `GOOGLE_SHEET_URL` en tu archivo `script.js`.
 */

function doPost(e) {
  // Configurar las cabeceras CORS para permitir peticiones desde cualquier origen
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  
  try {
    // Si la petición viene sin datos de postData, finalizar con error
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        "status": "error",
        "message": "Petición vacía o mal estructurada"
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    }
    
    // Obtener la hoja de cálculo activa y su primera pestaña
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getActiveSheet();
    
    // Parsear los datos JSON recibidos desde la Landing Page
    var data = JSON.parse(e.postData.contents);
    
    // Formatear la fecha actual de Chile
    var dateString = Utilities.formatDate(new Date(), "GMT-4", "yyyy-MM-dd HH:mm:ss");
    
    // Insertar una nueva fila al final con los 4 datos del formulario
    sheet.appendRow([
      dateString,
      data.nombre || "",
      data.rut || "",
      data.correo || "",
      data.liceo || ""
    ]);
    
    // Retornar respuesta de éxito en formato JSON
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "message": "Datos de matrícula guardados exitosamente"
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
    
  } catch(error) {
    // En caso de fallas, capturar el error y retornarlo estructurado
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  }
}

// Soporte para peticiones preflight OPTIONS (CORS)
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}
