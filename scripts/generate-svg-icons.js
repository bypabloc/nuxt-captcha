/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable enforce-typescript-only/enforce-typescript-only */
// scripts/generate-svg-icons.js

/**
 * Script para generar un archivo JSON con los iconos SVG precargados
 * Este script se ejecuta antes de la compilación/generación
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Para obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuración
const CONFIG = {
  basePath: path.resolve(__dirname, '../assets/icons'),
  // Nueva ruta en node_modules
  outputPath: path.resolve(
    __dirname,
    '../node_modules/vk/icons/generated.json',
  ),
  collectionName: 'vk',
  debug: true,
}

// Función para procesar SVG similar a la original
function processSvg(svg) {
  // Reemplazamos #fff con currentColor
  let processed = svg.replace(/#fff/g, 'currentColor')

  // Si contiene clipPath, intentamos simplificar el SVG
  if (
    processed.includes('clip-path="url(#') ||
    processed.includes('<clipPath')
  ) {
    // Eliminamos las referencias a clipPath
    processed = processed.replace(/clip-path="url\(#[^"]+\)"/g, '')

    // También eliminamos las definiciones de clipPath
    const startIdx = processed.indexOf('<defs>')
    const endIdx = processed.indexOf('</defs>')

    if (startIdx !== -1 && endIdx !== -1) {
      processed =
        processed.substring(0, startIdx) + processed.substring(endIdx + 7) // 7 es la longitud de </defs>
    }
  }

  // Aseguramos que tenga los atributos necesarios para UnoCSS
  if (!processed.includes('width=') || !processed.includes('height=')) {
    // Extraer el viewBox para obtener dimensiones
    const viewBoxMatch = processed.match(/viewBox="([^"]+)"/)
    if (viewBoxMatch && viewBoxMatch[1]) {
      const viewBoxParts = viewBoxMatch[1].split(' ').map(Number)
      if (viewBoxParts.length === 4) {
        const [, , width, height] = viewBoxParts

        // Añadir width y height si no existen
        if (!processed.includes('width=')) {
          processed = processed.replace('<svg', `<svg width="${width}"`)
        }
        if (!processed.includes('height=')) {
          processed = processed.replace('<svg', `<svg height="${height}"`)
        }
      }
    }
  }

  return processed
}

// Encontrar archivos SVG
function findAllSvgFiles(dir) {
  let results = []

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        results = results.concat(findAllSvgFiles(fullPath))
      } else if (entry.name.endsWith('.svg')) {
        results.push(fullPath)
      }
    }
  } catch (error) {
    console.error(`Error al escanear el directorio ${dir}:`, error)
  }

  return results
}

// Función principal que genera el JSON
function generateSvgIconsJson() {
  const result = {
    collection: {},
    safelist: [],
  }

  // Verificar si el directorio base existe
  if (!fs.existsSync(CONFIG.basePath)) {
    console.error(`El directorio base ${CONFIG.basePath} no existe.`)
    // Crear un directorio para los iconos si no existe
    try {
      fs.mkdirSync(CONFIG.basePath, { recursive: true })
      console.log(`Directorio creado: ${CONFIG.basePath}`)
    } catch (err) {
      console.error(`Error al crear el directorio: ${err.message}`)
    }
  }

  // Asegurarse de que existe el directorio para el archivo JSON de salida
  const outputDir = path.dirname(CONFIG.outputPath)
  if (!fs.existsSync(outputDir)) {
    try {
      fs.mkdirSync(outputDir, { recursive: true })
      console.log(`Directorio de salida creado: ${outputDir}`)
    } catch (err) {
      console.error(`Error al crear el directorio de salida: ${err.message}`)
    }
  }

  // Si no hay archivos SVG, crear un JSON vacío y salir
  const svgFiles = findAllSvgFiles(CONFIG.basePath)
  if (svgFiles.length === 0) {
    console.log(`No se encontraron archivos SVG en ${CONFIG.basePath}`)
    fs.writeFileSync(CONFIG.outputPath, JSON.stringify(result, null, 2))
    console.log(`Archivo JSON vacío creado en: ${CONFIG.outputPath}`)
    return
  }

  // Para guardar nombres de iconos y su contenido SVG
  for (const filePath of svgFiles) {
    try {
      // Obtener la ruta relativa al directorio base
      const relativePath = path.relative(
        CONFIG.basePath,
        path.dirname(filePath),
      )
      // Obtener el nombre del archivo sin extensión
      const fileName = path.basename(filePath, '.svg')

      // Crear un nombre de icono basado en la ruta anidada
      // Ejemplo: 'faces/circular/sad/darkgreen.svg' → 'faces-circular-sad-darkgreen'
      const iconName = relativePath
        ? `${relativePath.replace(/\\/g, '-').replace(/\//g, '-')}-${fileName}`
        : fileName

      // Leer y procesar el SVG
      const svg = fs.readFileSync(filePath, 'utf-8')
      const processedSvg = processSvg(svg)

      // Guardar el SVG en la colección
      if (!result.collection[CONFIG.collectionName]) {
        result.collection[CONFIG.collectionName] = {}
      }

      result.collection[CONFIG.collectionName][iconName] = processedSvg

      // Agregar al safelist
      result.safelist.push(`i-${CONFIG.collectionName}-${iconName}`)

      if (CONFIG.debug) {
        console.log(`Icono procesado: ${iconName}`)
      }
    } catch (error) {
      console.error(`Error al procesar el archivo ${filePath}:`, error)
    }
  }

  // Guardar el resultado en un archivo JSON
  fs.writeFileSync(CONFIG.outputPath, JSON.stringify(result, null, 2))

  if (CONFIG.debug) {
    console.log(
      `Total de iconos encontrados: ${Object.keys(result.collection[CONFIG.collectionName] || {}).length}`,
    )
    console.log(`Archivo JSON guardado en: ${CONFIG.outputPath}`)
  }
}

// Ejecutar la función principal
generateSvgIconsJson()
