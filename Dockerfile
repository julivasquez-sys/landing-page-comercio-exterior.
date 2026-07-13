# Usar la imagen ligera y de alto rendimiento de Nginx basada en Alpine
FROM nginx:alpine

# Copiar los archivos estáticos de la landing page al directorio público de Nginx
COPY . /usr/share/nginx/html

# Exponer el puerto 80 que usa Nginx por defecto
EXPOSE 80

# Iniciar Nginx y mantener el proceso ejecutándose en primer plano
CMD ["nginx", "-g", "daemon off;"]
