// src/pages/Tools/QRBatch.jsx
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

// 👉 pega aquí tu lista
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

export default function QRBatch() {
  const [items, setItems] = useState([]) // [{matricula, nombre, dataUrl}]

  useEffect(() => {
    const run = async () => {
      const out = []
      for (const a of alumnos) {
        // Valor del QR: solo la matrícula (lo que vas a escanear en la tablet)
        const value = a.matricula

        // Genera dataURL del QR (PNG)
        const qrPng = await QRCode.toDataURL(value, {
          width: 512,
          margin: 1,
          errorCorrectionLevel: 'M'
        })

        // (Opcional) Componer una imagen con texto debajo
        const labeled = await composeWithLabel(qrPng, a.matricula, a.nombre)
        out.push({ ...a, dataUrl: labeled })
      }
      setItems(out)
    }
    run()
  }, [])

  // Dibuja el QR sobre un canvas y le agrega el texto (matrícula y nombre)
  const composeWithLabel = (pngUrl, matricula, nombre) => new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const padding = 20
      const textLines = [matricula, nombre]
      const qrSize = img.width
      const lineHeight = 28
      const fontSize = 22

      // Canvas total: QR + espacio para dos líneas
      const w = qrSize
      const h = qrSize + padding + textLines.length * lineHeight + padding
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')

      // Fondo blanco
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, w, h)

      // QR centrado arriba
      ctx.drawImage(img, 0, 0)

      // Texto
      ctx.fillStyle = '#111'
      ctx.font = `${fontSize}px Poppins, Arial, sans-serif`
      ctx.textAlign = 'center'
      const startY = qrSize + padding + fontSize
      textLines.forEach((t, i) => {
        ctx.fillText(t, w / 2, startY + i * lineHeight)
      })

      resolve(c.toDataURL('image/png'))
    }
    img.src = pngUrl
  })

  const downloadOne = (al) => {
    const a = document.createElement('a')
    a.href = al.dataUrl
    a.download = `QR_${al.matricula}.png`
    a.click()
  }

  const downloadAllZip = async () => {
    const zip = new JSZip()
    items.forEach((al) => {
      const base64 = al.dataUrl.split('base64,')[1]
      zip.file(`QR_${al.matricula}.png`, base64, { base64: true })
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'qrs_alumnos.zip')
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Generador de QR (matrícula)</h2>
      <p>Valor codificado en cada QR: la matrícula del alumno.</p>

      <div style={{ margin: '12px 0' }}>
        <button
          onClick={downloadAllZip}
          disabled={!items.length}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: 0,
            background: '#71007B',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Descargar todo (.zip)
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16
        }}
      >
        {items.map((al) => (
          <div key={al.matricula} style={{ background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}>
            <img src={al.dataUrl} alt={al.matricula} style={{ width: '100%', display: 'block' }} />
            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 600 }}>{al.matricula}</div>
              <div style={{ fontSize: 12, color: '#555' }}>{al.nombre}</div>
            </div>
            <button
              onClick={() => downloadOne(al)}
              style={{
                marginTop: 10,
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #ccc',
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              Descargar PNG
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
