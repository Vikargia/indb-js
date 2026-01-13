# Indb.js Dokumentation

Willkommen in der Dokumentation des Projekts Indb.js.

---

## `await init(database, version, tables)`

Die Methode `init` öffnet eine Verbindung zur Datenbank (oder erstellt sie). Sie akzeptiert drei erforderliche Argumente:

- **database** — Name der Datenbank (String).
- **version** — Versionsnummer (Number).
- **tables** — JSON-Objekt mit dem Tabellenschema.

### Beispiel für ein Tabellen-Objekt

```javascript
const tables = {
    songs: { // Name der Tabelle (ObjectStore)
        increment: "id", // Feld, das als auto-inkrementierter Primärschlüssel dient
        indexes: { // Indizes für die Tabelle 'songs'
            title: {
                name: "title",
                unique: false,
                multiEntry: false
            }
        }
    }
    // ...andere Tabellen
};
```

### Beispiel für die Initialisierung

```javascript
const indb = new Indb();
await indb.init("mydb", 1, tables);
```

### Hinweis

In der Index-Beschreibung kann das Feld `name` weggelassen werden, wenn der Indexname mit dem Feldnamen in der Datenbank übereinstimmt. Geben Sie es nur an, wenn Sie dem Index einen anderen Namen geben möchten als dem Tabellenfeld.

---

## `await importData(json, overwrite = false)`

Die Methode `importData` ermöglicht den Import von Daten aus einem JSON-Objekt in die Datenbank.

- **json** — Datenobjekt. **Achtung!** Dies muss ein JavaScript-Objekt sein, kein JSON-String. Erforderliches Argument.
- **overwrite** — Boolescher Wert.
    - `true`: Tabelle vollständig überschreiben (alte Daten werden gelöscht).
    - `false`: (Standard) neue Daten zu den bestehenden hinzufügen.

### Beispiel für die Datenstruktur

```javascript
const jsonData = {
    songs: [ // Array von Datensätzen für die Tabelle 'songs'
        {
            title: "song1",
            path: "[https://mysong.local/file1.mp3](https://mysong.local/file1.mp3)"
        },
        {
            title: "Song2",
            path: "[https://mysong.local/file2.mp3](https://mysong.local/file2.mp3)"
        }
    ]
    // ...Daten für andere Tabellen
};
```

### Verwendung

```javascript
await indb.importData(jsonData); // Fügt neue Datensätze zu den alten hinzu
await indb.importData(jsonData, true); // Leert Tabellen und schreibt nur neue Daten
```

---

## `await exportData()`

Diese Methode exportiert alle Daten aus der Datenbank als ein Objekt.

### Beispiel

```javascript
const data = await indb.exportData();
console.log(data);
```

---

## `await drop(database)`

Diese Methode löscht die angegebene Datenbank aus dem Browser.

**Achtung!** Für ein erfolgreiches Löschen müssen alle Tabs mit dieser Website geschlossen werden, außer demjenigen, in dem das Löschen ausgeführt wird. Dies ist eine Anforderung der IndexedDB-Spezifikation (Event `onblocked`).

### Beispiel

```javascript
await indb.drop("mydb"); // gibt bei Erfolg true zurück
```

---

## `await add(table, data)`

Die Methode fügt einen einzelnen Datensatz oder ein Array von Datensätzen in die Tabelle ein. Das Auto-Inkrement-Feld muss nicht angegeben werden, die Datenbank weist es automatisch zu.

### Beispiel

```javascript
// Ein einzelner Datensatz
await indb.add("songs", {
    title: "song3",
    path: "[https://mysongs.local/file3.mp3](https://mysongs.local/file3.mp3)"
});

// Mehrere Datensätze
await indb.add("songs", [
    { title: "song4", path: "..." },
    { title: "song5", path: "..." }
]);
```

---

## `await put(table, data)`

Die Methode aktualisiert einen Datensatz in der Tabelle oder erstellt einen neuen, falls der Schlüssel nicht existiert. Sie akzeptiert ebenfalls ein Array von Objekten oder ein einzelnes Objekt.

**Wichtig:** Die Methode überschreibt das Objekt vollständig. Wenn Sie ein unvollständiges Objekt übergeben (ohne einige Felder), gehen die alten Felder verloren.

### Beispiel

```javascript
await indb.put("songs", {
    id: 1, // ID ist für Aktualisierungen zwingend erforderlich
    title: "songs34",
    path: "[https://mysongs.local/file3.mp3](https://mysongs.local/file3.mp3)"
});
// Funktioniert mit einem Array von Objekten genau wie 'add', vergessen Sie aber nicht die IDs.
```

### Hinweis

Wenn Sie das Primärschlüsselfeld (z. B. `id`) nicht übergeben, verhält sich die Methode wie `add` — sie fügt einen neuen Datensatz hinzu, anstatt den alten zu aktualisieren.

---

## `await delete(table, id)`

Die Methode löscht einen einzelnen Datensatz anhand seines Schlüssels (ID) aus der Tabelle.

### Beispiel

```javascript
await indb.delete("songs", 3);
```

---

## `await deleteMany(table, ids)`

Die Methode löscht mehrere Datensätze basierend auf einer Liste ihrer IDs.

### Beispiel

```javascript
await indb.deleteMany("songs", [1, 2, 3]);
```

---

## `await update(table, id, data)`

Die Methode ermöglicht es, bestimmte Felder in einem bestehenden Datensatz zu ändern, ohne das gesamte Objekt zu überschreiben.

### Beispiel

```javascript
await indb.update("songs", 3, { title: "song321" });
```

---

## `await clear(table)`

Die Methode leert die angegebene Tabelle vollständig (löscht alle Datensätze).

### Beispiel

```javascript
await indb.clear("songs");
```

---

## `await get(table, id)`

Die Methode ruft einen einzelnen Datensatz anhand seiner ID aus der Tabelle ab.

### Beispiel

```javascript
let data = await indb.get("songs", 1);
console.log(data); 
// Ergebnis: {title: "song1", path: "[https://mysongs.local/file1.mp3](https://mysongs.local/file1.mp3)", id: 1}
```

---

## `await findBy(table, index, value)`

Die Methode findet den **ersten** passenden Datensatz, der den Suchkriterien entspricht (Index + Wert).

### Beispiel

```javascript
let data = await indb.findBy("songs", "title", "song1");
```

---

## `await findAll(table, index, value)`

Die Methode ruft ein Array aller Datensätze ab, die den Suchkriterien entsprechen.

### Beispiel

```javascript
// Gibt ein Array aller Songs zurück, bei denen title === "song1" ist
let data = await indb.findAll("songs", "title", "song1"); 
```

---

## `await getAll(table)`

Die Methode gibt absolut alle Datensätze aus der angegebenen Tabelle zurück.

### Beispiel

```javascript
let data = await indb.getAll("songs");
```

---

## `tokens(string)`

Eine Hilfsmethode. Sie wandelt einen String in ein Array von Wörtern (Tokens) um. Sie entfernt Satzzeichen und behält nur Buchstaben und Zahlen bei. Dies ist nützlich für die Erstellung von Suchindizes mit `multiEntry: true`.

### Beispiel

```javascript
let a = indb.tokens("hello, world!");
console.log(a); // ["hello", "world"]
```

---

## `await search(table, index, value, op = "and")`

Die Methode führt eine Volltextsuche in der Tabelle durch (unter Verwendung von Tokenisierung).
Als `value` wird eine Zeichenkette aus Wörtern übergeben.

Die Methode akzeptiert einen optionalen vierten Parameter `op` (Suchlogik):
- `"and"` (Standard): Der Datensatz muss **alle** Wörter aus der Anfrage enthalten (Schnittmenge).
- `"or"`: Der Datensatz muss **mindestens eines** der Wörter aus der Anfrage enthalten (Vereinigung).

### Beispiel

```javascript
// Findet nur Datensätze, die SOWOHL "My" ALS AUCH "super" UND "song" enthalten
let strictSearch = await indb.search("songs", "title", "My super song", "and"); 

// Findet alle Datensätze, die IRGENDEINES dieser Wörter enthalten
let broadSearch = await indb.search("songs", "title", "rock metal", "or");
```

**Hinweis:** Innerhalb der Methode wird eine automatische Tokenisierung des Suchstrings durchgeführt. Der Entwickler muss `tokens()` nicht manuell aufrufen. Wenn Sie eine exakte Übereinstimmung der gesamten Phrase (ohne Aufteilung in Wörter) benötigen, verwenden Sie besser `findBy` oder `findAll`.

---

## `await select(obj)`

Eine universelle Methode zur Datenauswahl mit Unterstützung für Paginierung und Sortierung (verwendet Cursor). Akzeptiert ein Parameterobjekt:

- **table** — Name der Tabelle (erforderlich).
- **index** — Name des Index (optional, wenn nicht nach dem Primärschlüssel gesucht wird).
- **value** — Suchwert (wird nur zusammen mit index angewendet).
- **offset** — Wie viele Datensätze übersprungen werden sollen.
- **limit** — Wie viele Datensätze zurückgegeben werden sollen.
- **direction** — Sortierrichtung (`next` oder `prev`).

Der Parameter `value` kann ein String oder ein Bereich (IDBKeyRange-Objekt) sein.

**Beispiele für Bereiche:**
```javascript
{
    value: "hello" // Exakte Übereinstimmung
}
// oder
{
    value: { start: 1, end: 5 } // Bereich: z. B. von 1 bis 5 Jahren
}
```

### Abfrage-Beispiel

```javascript
let querySelect = await indb.select({
    table: "users",
    index: "shop",      // Suche über den Index 'shop'
    value: "Kaufland",  // Wert: Kaufland
    offset: 10,         // Die ersten 10 Ergebnisse überspringen
    limit: 10,          // Die nächsten 10 zurückgeben
    direction: "prev"   // Sortierung in umgekehrter Reihenfolge
});
```

---

## `await remove(obj)`

Methode zum massenhaften Löschen von Datensätzen. Akzeptiert das gleiche Parameterobjekt wie `select` (ermöglicht das Löschen eines Datenbereichs oder gefilterter Daten).

---

## `await count(obj)`

Die Methode gibt die Anzahl der Datensätze zurück, die der Anfrage entsprechen. Das Parameterobjekt ist identisch mit der `select`-Methode.