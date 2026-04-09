1) Subi esta carpeta completa a GitHub.
2) En Netlify, importá el repo.
3) En Site configuration > Environment variables, agregá:
   ADMIN_PASSWORD = Ringo1660@
   (con scope para Functions)
4) Deploy.
5) Entrá al sitio y presioná la tecla A para abrir el admin.
6) Subí imágenes y apretá "Guardar y aplicar".

Archivos principales:
- index.html
- netlify.toml
- netlify/functions/*
- package.json

Comandos locales opcionales:
- npm install
- netlify dev
