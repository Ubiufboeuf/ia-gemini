# Gemini 1.5 API

La API Gemini 1.5 de Google permite integrar modelos avanzados de lenguaje y visión en tus aplicaciones.  
Esta API soporta generación de texto, comprensión de imágenes, y más.

## Documentación

- Documentación oficial: https://ai.google.dev/gemini-api/docs

## Uso rápido

```bash
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=TU_API_KEY
Content-Type: application/json

{
  "contents": [
    {
      "parts": [
        {
          "text": "Tu prompt aquí"
        }
      ]
    }
  ]
}