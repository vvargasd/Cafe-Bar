## Reglas no negociables
- Ningún elemento interactivo < 48x48px (uso con guantes/prisa, tablet)
- Paleta: fondo #FAF8F5, texto/botones #3E2723. No introducir otros colores sin justificar
- Layout PosScreen: 70% operación / 30% comanda. La grilla de productos NO se reordena dinámicamente
- IDs generados SIEMPRE en cliente. El backend nunca asigna IDs
- Toda escritura pasa por RxDB primero. La UI nunca espera a la red

## Excepciones de paleta (justificadas y aprobadas)
- Escala tonal de marrón (`#795548`, `#A1887F`, `#BCAAA4`, `#D7CCC8`, `#E8E2D9`, `#EFEBE9`): variaciones del `#3E2723` aprobado, para jerarquía de texto/bordes/hover
- Colores por categoría de producto en `ProductCatalog.tsx` (`#0288D1` Nevera, `#6D4C41` Máquina, `#E64A19` Comida Rápida, `#C2185B` Confitería, `#B8860B` Licores, `#FFC107` default/top-seller, también usado en `TableMap.tsx` para el total de mesa ocupada): reconocimiento visual rápido por categoría
- Colores semánticos de acción (`#4CAF50`/`#43A047` verde en "Cobrar en Caja", `#E53935` rojo en swipe-to-delete): convención universal cobrar/eliminar
