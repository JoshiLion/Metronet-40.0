const QRCode = require("qrcode");
const fs = require("fs");

const alumnos = [
  { nombre: "ALFARO PIMENTEL VALERIA XIMENA", matricula: "203110341", contraseña: "1604", imagenUrl: "user-203110341.jpg" },
  { nombre: "BALMACEDA SANCHEZ ALESSANDRO", matricula: "223111900", contraseña: "0907", imagenUrl: "user-223111900.jpg" },
  { nombre: "BERLANGA VAZQUEZ JOSE LUIS", matricula: "223111193", contraseña: "2608", imagenUrl: "user-223111193.jpg" },
  { nombre: "CARRASCO MARTINEZ DAVID", matricula: "223111854", contraseña: "2002", imagenUrl: "user-223111854.jpg" },
  { nombre: "CORTES RESENDIZ MICHEL", matricula: "223110219", contraseña: "2905", imagenUrl: "user-223110219.jpg" },
  { nombre: "FLORES ROSALES ARIEL NAIM", matricula: "223110717", contraseña: "2610", imagenUrl: "user-223110717.jpg" },
  { nombre: "GARCIA HERNANDEZ TANIA SENYAZI", matricula: "223111914", contraseña: "0806", imagenUrl: "user-223111914.jpg" },
  { nombre: "GONZALEZ GARCIA JUAN DIEGO", matricula: "223110719", contraseña: "2707", imagenUrl: "user-223110719.jpg" },
  { nombre: "GRAJEDA MORENO ALAN", matricula: "223110100", contraseña: "2111", imagenUrl: "user-223110100.jpg" },
  { nombre: "HERNANDEZ CASTAÑEDA ERICK MANUEL", matricula: "223111116", contraseña: "0910", imagenUrl: "user-223111116.jpg" },
  { nombre: "HERNANDEZ GARCIA JESSICA", matricula: "223111294", contraseña: "2710", imagenUrl: "user-223111294.jpg" },
  { nombre: "HERNANDEZ HERNANDEZ ALFREDO JOSUE", matricula: "223110365", contraseña: "2405", imagenUrl: "user-223110365.jpg" },
  { nombre: "HINOJOSA CARRILLO YAEL MARTIN", matricula: "223110303", contraseña: "1001", imagenUrl: "user-223110303.jpg" },
  { nombre: "JUAREZ VITE EFREN", matricula: "223111064", contraseña: "0301", imagenUrl: "user-223111064.jpg" },
  { nombre: "LOPEZ ESQUIVEL METZTONALLI", matricula: "213111964", contraseña: "0804", imagenUrl: "user-213111964.jpg" },
  { nombre: "LOZANO ANGELES PAOLA VANESSA", matricula: "223111852", contraseña: "2511", imagenUrl: "user-223111852.jpg" },
  { nombre: "MARTINEZ GUERRERO ALAN", matricula: "223111621", contraseña: "2306", imagenUrl: "user-223111621.jpg" },
  { nombre: "MARTINEZ RUBIO JOSUE", matricula: "223111057", contraseña: "2911", imagenUrl: "user-223111057.jpg" },
  { nombre: "MAYOR MARCELINO JAIR", matricula: "223110485", contraseña: "0911", imagenUrl: "user-223110485.jpg" },
  { nombre: "MORALES GARCIA ALFONSO", matricula: "223110550", contraseña: "2807", imagenUrl: "user-223110550.jpg" },
  { nombre: "NAVARRETE LAZCANO JOB", matricula: "223111192", contraseña: "0610", imagenUrl: "user-223111192.jpg" },
  { nombre: "PEREZ LOPEZ YAMIR", matricula: "223111930", contraseña: "2706", imagenUrl: "user-223111930.jpg" },
  { nombre: "PEREZ TORRUCO HECTOR", matricula: "223111089", contraseña: "1901", imagenUrl: "user-223111089.jpg" },
  { nombre: "QUINTANA ESPINOSA ANGEL EDUARDO", matricula: "223111395", contraseña: "0107", imagenUrl: "user-223111395.jpg" },
  { nombre: "RAMIREZ HERNANDEZ EDUARDO SAHID", matricula: "223112018", contraseña: "0809", imagenUrl: "user-223112018.jpg" },
  { nombre: "RAMIREZ ROMERO ANA PAOLA", matricula: "223111939", contraseña: "2605", imagenUrl: "user-223111939.jpg" },
  { nombre: "RIVERO CRUZ FATIMA JULIET", matricula: "223110326", contraseña: "2207", imagenUrl: "user-223110326.jpg" },
  { nombre: "ROJAS MEJIA YAEL", matricula: "223111293", contraseña: "0202", imagenUrl: "user-223111293.jpg" },
  { nombre: "SALAS CASASOLA URIEL", matricula: "223110914", contraseña: "2904", imagenUrl: "user-223110914.jpg" },
  { nombre: "SALINAS HERNANDEZ ALONDRA VIOLETA", matricula: "223110527", contraseña: "2605", imagenUrl: "user-223110527.jpg" },
  { nombre: "VAZQUEZ MALDONADO ALBERTO", matricula: "223110508", contraseña: "2106", imagenUrl: "user-223110508.jpg" },
  { nombre: "ZAMUDIO GARDUÑO AXL SAUL", matricula: "223110141", contraseña: "2801", imagenUrl: "user-223110141.jpg" }
];


// Carpeta para guardar los QR
const carpeta = "./qrs";
if (!fs.existsSync(carpeta)) {
  fs.mkdirSync(carpeta);
}

alumnos.forEach(alumno => {
  const filePath = `${carpeta}/${alumno.matricula}.png`;

  // Generar QR solo con la matrícula
  QRCode.toFile(filePath, alumno.matricula, {
    color: {
      dark: "#000000",  // QR negro
      light: "#ffffff"  // Fondo blanco
    },
    width: 300
  }, (err) => {
    if (err) throw err;
    console.log(`QR generado: ${filePath}`);
  });
});
