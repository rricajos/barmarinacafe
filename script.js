function processImage(event) {
  const file = event.target.files[0];
  if (!file) {
      alert("Por favor, sube una imagen.");
      return;
  }
  
  document.getElementById("priceResult").textContent = "Cargando...";

  const reader = new FileReader();
  reader.onload = function() {
      const img = new Image();
      img.src = reader.result;

      img.onload = function() {
          // Crear un canvas para preprocesar la imagen
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;

          // Convertir la imagen a escala de grises
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
              const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
              imageData.data[i] = avg;
              imageData.data[i + 1] = avg;
              imageData.data[i + 2] = avg;
          }
          ctx.putImageData(imageData, 0, 0);

          // Usa Tesseract para hacer OCR en la imagen procesada
          Tesseract.recognize(
              canvas,
              'eng',
              {
                  logger: (m) => console.log(m),
                  tessedit_pageseg_mode: 6  // Usa PSM 6 para texto en una línea
              }
          ).then(({ data: { text } }) => {
              // Buscar patrones de precios en el texto
              const pricePattern = /\$\d+(\.\d{2})?/g;
              const prices = text.match(pricePattern);

              // Mostrar el precio extraído
              const priceResult = document.getElementById("priceResult");
              if (prices && prices.length > 0) {
                  priceResult.textContent = "Precios detectados: " + prices.join(", ");
              } else {
                  priceResult.textContent = "No se encontró ningún precio en la imagen.";
              }
          }).catch((error) => {
              console.error("Error al procesar la imagen:", error);
              document.getElementById("priceResult").textContent = "Ocurrió un error al procesar la imagen.";
          });
      };
  };
  reader.readAsDataURL(file);
}
