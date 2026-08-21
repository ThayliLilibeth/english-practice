# Mi Práctica de Inglés

App web local e interactiva para mejorar tu inglés: flashcards de vocabulario
con repetición espaciada (sistema Leitner), ejercicios de gramática/frases,
y un formulario para ir añadiendo tu propio contenido. Todo tu progreso y
contenido se guarda automáticamente en `data.json`, en esta misma carpeta.

## Cómo usarla

1. Abre una terminal en esta carpeta.
2. Ejecuta:
   ```
   ./run.sh
   ```
   (o `python3 server.py` si prefieres)
3. Abre tu navegador en: http://127.0.0.1:8420
4. Deja la terminal abierta mientras usas la app. Para detenerla, presiona `Ctrl+C`.

## Secciones

- **Flashcards**: repasa el vocabulario que toca hoy. Toca la tarjeta para ver
  la traducción y marca "Otra vez", "Difícil" o "Bien" — esto ajusta cuándo
  volverá a aparecer esa palabra.
- **Frases y Gramática**: ejercicios de completar espacios o traducir frases.
- **Añadir contenido**: formularios para agregar nuevas palabras o ejercicios.
- **Mi contenido**: ver y borrar lo que has guardado.
- **Estadísticas**: racha de estudio, precisión, y progreso por nivel.

## Dónde vive tu información

Todo se guarda en `data.json` en esta carpeta (no en el navegador), así que
tu progreso persiste aunque cambies de navegador o borres el caché. Puedes
copiar ese archivo como respaldo cuando quieras.
