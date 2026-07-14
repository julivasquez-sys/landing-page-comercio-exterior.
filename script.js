/**
 * ==========================================================================
 * GUÍA DE INTEGRACIÓN CON GOOGLE SHEETS
 * ==========================================================================
 * 
 * Para enviar los datos capturados en este formulario directamente a una 
 * hoja de cálculo de Google Sheets sin necesidad de un backend propio, sigue 
 * estos pasos:
 * 
 * 1. PREPARACIÓN EN GOOGLE SHEETS:
 *    a. Crea una nueva hoja de cálculo en Google Drive.
 *    b. En la primera fila, escribe exactamente las cabeceras de columna:
 *       Fecha | Nombre | RUT | Correo | Telefono | Consulta_Especifica
 * 
 * 2. CONFIGURACIÓN DEL SCRIPT DE GOOGLE APPS:
 *    a. Ve al menú superior: Extensiones > Apps Script.
 *    b. Borra el código existente y pega la lógica del archivo google-sheets-script.gs.
 * 
 * 3. DESPLIEGUE DEL APPS SCRIPT:
 *    a. Haz clic en "Implementar" (Deploy) > "Nueva implementación".
 *    b. Selecciona tipo: "Aplicación web".
 *    c. En "Quién tiene acceso", selecciona "Cualquiera" (indispensable para peticiones públicas).
 *    d. Copia la URL de la aplicación web que te proporciona.
 * 
 * 4. CONEXIÓN EN ESTE ARCHIVO:
 *    a. Busca la variable `GOOGLE_SHEET_URL` abajo y pega tu URL de despliegue.
 */

// Pega aquí la URL de tu aplicación web de Google Apps Script cuando esté lista.
const GOOGLE_SHEET_URL = ''; 

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('duocForm');
  const rutInput = document.getElementById('rut');
  const formContainer = document.getElementById('formContainer');
  const successState = document.getElementById('successState');
  
  // Elementos del formulario para validaciones en tiempo real
  const nombreInput = document.getElementById('nombre');
  const correoInput = document.getElementById('correo');
  const telefonoInput = document.getElementById('telefono');
  const consultaSelect = document.getElementById('consulta');
  
  // ==========================================================================
  // VALIDADOR Y FORMATEADOR DE RUT CHILENO (Algoritmo Módulo 11)
  // ==========================================================================
  
  // Formatear RUT mientras se escribe (ej: 12345678k -> 12.345.678-K)
  rutInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9kK]/g, ''); // Limpiar caracteres no válidos
    
    if (value.length > 1) {
      const dv = value.slice(-1).toUpperCase();
      let body = value.slice(0, -1);
      
      // Aplicar formato de miles al cuerpo
      body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      
      e.target.value = `${body}-${dv}`;
    } else {
      e.target.value = value.toUpperCase();
    }
    
    validateRutInput();
  });

  function validateRutInput() {
    const rawRut = rutInput.value;
    if (rawRut.length < 8) {
      setFieldError(rutInput, 'El RUT ingresado es muy corto');
      return false;
    }
    
    if (checkRut(rawRut)) {
      setFieldSuccess(rutInput);
      return true;
    } else {
      setFieldError(rutInput, 'El RUT ingresado no es válido');
      return false;
    }
  }
  
  function checkRut(rutComplete) {
    // Limpiar puntos y guiones
    let cleanRut = rutComplete.replace(/\./g, '').replace(/-/g, '').trim();
    
    if (cleanRut.length < 2) return false;
    
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();
    
    // Validar que el cuerpo sean solo números
    if (!/^[0-9]+$/.test(body)) return false;
    
    // Calcular dígito verificador
    let sum = 0;
    let multiplier = 2;
    
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body.charAt(i), 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const expectedDv = 11 - (sum % 11);
    let calculatedDv = '';
    
    if (expectedDv === 11) calculatedDv = '0';
    else if (expectedDv === 10) calculatedDv = 'K';
    else calculatedDv = expectedDv.toString();
    
    return dv === calculatedDv;
  }

  // ==========================================================================
  // VALIDACIONES EN TIEMPO REAL PARA OTROS CAMPOS
  // ==========================================================================
  
  nombreInput.addEventListener('blur', () => {
    if (nombreInput.value.trim().length < 5) {
      setFieldError(nombreInput, 'Por favor, ingresa tu nombre completo');
    } else {
      setFieldSuccess(nombreInput);
    }
  });

  correoInput.addEventListener('blur', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoInput.value.trim())) {
      setFieldError(correoInput, 'Ingresa un correo electrónico válido');
    } else {
      setFieldSuccess(correoInput);
    }
  });

  telefonoInput.addEventListener('input', (e) => {
    // Solo permitir números y signo +
    e.target.value = e.target.value.replace(/[^0-9+]/g, '');
  });

  telefonoInput.addEventListener('blur', () => {
    const rawVal = telefonoInput.value.replace(/\+/g, '');
    if (rawVal.length < 8) {
      setFieldError(telefonoInput, 'Ingresa un teléfono celular válido (mínimo 8 dígitos)');
    } else {
      setFieldSuccess(telefonoInput);
    }
  });

  // Helpers visuales de validación
  function setFieldError(inputElement, message) {
    const group = inputElement.closest('.form-group');
    group.classList.remove('success');
    group.classList.add('error');
    const msgElement = group.querySelector('.validation-msg');
    if (msgElement) msgElement.textContent = message;
  }

  function setFieldSuccess(inputElement) {
    const group = inputElement.closest('.form-group');
    group.classList.remove('error');
    group.classList.add('success');
  }

  // ==========================================================================
  // ENVÍO DEL FORMULARIO Y CONEXIÓN API
  // ==========================================================================
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Ejecutar todas las validaciones antes de enviar
    const isRutValid = validateRutInput();
    const isNombreValid = nombreInput.value.trim().length >= 5;
    const isCorreoValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoInput.value.trim());
    const isTelefonoValid = telefonoInput.value.replace(/\+/g, '').length >= 8;
    
    if (!isNombreValid) setFieldError(nombreInput, 'Por favor, ingresa tu nombre completo');
    if (!isCorreoValid) setFieldError(correoInput, 'Ingresa un correo electrónico válido');
    if (!isTelefonoValid) setFieldError(telefonoInput, 'Ingresa un teléfono celular válido');
    
    if (!isRutValid || !isNombreValid || !isCorreoValid || !isTelefonoValid) {
      // Enfocar el primer elemento con error
      const firstError = form.querySelector('.form-group.error .form-input');
      if (firstError) firstError.focus();
      return;
    }
    
    // Cambiar estado del botón a "Procesando..."
    const submitBtn = form.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Procesando...</span>';
    
    // Estructura de datos recopilada (5 campos del diseño original)
    const formData = {
      nombre: nombreInput.value.trim(),
      rut: rutInput.value.trim(),
      correo: correoInput.value.trim(),
      telefono: telefonoInput.value.trim(),
      consulta: consultaSelect.value
    };

    console.log('Enviando datos de registro:', formData);

    // Integración de envío a Google Sheets
    if (GOOGLE_SHEET_URL) {
      try {
        const response = await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors', // Para evitar bloqueos CORS en peticiones de Google Apps Script
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        console.log('Respuesta de Google Sheets registrada');
      } catch (error) {
        console.error('Error al conectar con Google Sheets:', error);
      }
    } else {
      console.warn('URL de Google Sheets no configurada. Saltando envío de datos y simulando éxito.');
    }

    // Pequeño retardo para dar sensación de procesamiento premium
    setTimeout(() => {
      // Ocultar formulario con animación de desvanecimiento
      formContainer.style.transition = 'opacity 0.3s ease';
      formContainer.style.opacity = '0';
      
      setTimeout(() => {
        formContainer.style.display = 'none';
        
        // Mostrar vista de éxito
        successState.style.display = 'block';
        successState.style.opacity = '0';
        successState.style.transition = 'opacity 0.5s ease';
        
        // Reflejar el nombre en el mensaje de éxito para personalización de UX
        const successUser = document.getElementById('successUserName');
        if (successUser) {
          successUser.textContent = formData.nombre.split(' ')[0]; // Usar solo el primer nombre
        }
        
        // Disparar animación de entrada del éxito
        setTimeout(() => {
          successState.style.opacity = '1';
        }, 50);

        // Habilitar y descargar automáticamente el archivo guia_final.pdf
        try {
          const downloadLink = document.createElement('a');
          downloadLink.href = 'guia_final.pdf';
          downloadLink.download = 'guia_final.pdf';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } catch (downloadError) {
          console.error('Error al iniciar la descarga automática de guia_final.pdf:', downloadError);
        }

      }, 300);
    }, 1000);
  });
});
