# Indb.js Documentation

Welcome to the Indb.js documentation.

---

## `await init(database, version, tables)`

The `init` method opens a connection to the database (or creates it). It accepts three mandatory arguments:

- **database** — database name (string).
- **version** — version number (number).
- **tables** — JSON object defining the table schema.

### Table Object Example

```javascript
const tables = {
    songs: { // Table name (ObjectStore)
        increment: "id", // Field to be used as the auto-incrementing primary key
        indexes: { // Indexes for the 'songs' table
            title: {
                name: "title",
                unique: false,
                multiEntry: false
            }
        }
    }
    // ...other tables
};
```

### Initialization Example

```javascript
const indb = new Indb();
await indb.init("mydb", 1, tables);
```

### Note

In the index description, the `name` field can be omitted if the index name matches the field name in the database. Specify it only if you want the index to have a different name than the table field.

---

## `await importData(json, overwrite = false)`

The `importData` method allows importing data from a JSON object into the database.

- **json** — data object. **Attention!** This must be a JavaScript object, not a JSON string. Mandatory argument.
- **overwrite** — boolean value.
    - `true`: completely overwrite the table (old data is deleted).
    - `false`: (default) append new data to existing data.

### Data Structure Example

```javascript
const jsonData = {
    songs: [ // Array of records for the 'songs' table
        {
            title: "song1",
            path: "[https://mysong.local/file1.mp3](https://mysong.local/file1.mp3)"
        },
        {
            title: "Song2",
            path: "[https://mysong.local/file2.mp3](https://mysong.local/file2.mp3)"
        }
    ]
    // ...data for other tables
};
```

### Usage

```javascript
await indb.importData(jsonData); // Append new records to old ones
await indb.importData(jsonData, true); // Clear tables and insert only new data
```

---

## `await exportData()`

This method exports all data from the database as a single object.

### Example

```javascript
const data = await indb.exportData();
console.log(data);
```

---

## `await drop(database)`

This method deletes the specified database from the browser.

**Attention!** To successfully delete the database, you must close all tabs with this site open, except for the one performing the deletion. This is an IndexedDB specification requirement (`onblocked` event).

### Example

```javascript
await indb.drop("mydb"); // returns true on success
```

---

## `await add(table, data)`

The method adds a single record or an array of records to the table. You do not need to specify the auto-increment field; the database will assign it automatically.

### Example

```javascript
// Single record
await indb.add("songs", {
    title: "song3",
    path: "[https://mysongs.local/file3.mp3](https://mysongs.local/file3.mp3)"
});

// Multiple records
await indb.add("songs", [
    { title: "song4", path: "..." },
    { title: "song5", path: "..." }
]);
```

---

## `await put(table, data)`

The method updates a record in the table or creates a new one if the key does not exist. It also accepts an array of objects or a single object.

**Important:** The method completely overwrites the object. If you pass a partial object (missing some fields), the old fields will be lost.

### Example

```javascript
await indb.put("songs", {
    id: 1, // ID is mandatory for updates
    title: "songs34",
    path: "[https://mysongs.local/file3.mp3](https://mysongs.local/file3.mp3)"
});
// Works with an array of objects just like 'add', but remember to include IDs.
```

### Note

If you do not provide the primary key field (e.g., `id`), the method will act like `add` — inserting a new record instead of updating the old one.

---

## `await delete(table, id)`

The method deletes a single record from the table by its key (ID).

### Example

```javascript
await indb.delete("songs", 3);
```

---

## `await deleteMany(table, ids)`

The method deletes multiple records based on a list of their IDs.

### Example

```javascript
await indb.deleteMany("songs", [1, 2, 3]);
```

---

## `await update(table, id, data)`

The method allows modifying specific fields in an existing record without overwriting the entire object.

### Example

```javascript
await indb.update("songs", 3, { title: "song321" });
```

---

## `await clear(table)`

The method completely clears the specified table (deletes all records).

### Example

```javascript
await indb.clear("songs");
```

---

## `await get(table, id)`

The method retrieves a single record from the table by its ID.

### Example

```javascript
let data = await indb.get("songs", 1);
console.log(data); 
// Result: {title: "song1", path: "[https://mysongs.local/file1.mp3](https://mysongs.local/file1.mp3)", id: 1}
```

---

## `await findBy(table, index, value)`

The method finds the **first** record matching the search criteria (index + value).

### Example

```javascript
let data = await indb.findBy("songs", "title", "song1");
```

---

## `await findAll(table, index, value)`

The method retrieves an array of all records matching the search criteria.

### Example

```javascript
// Returns an array of all songs where title === "song1"
let data = await indb.findAll("songs", "title", "song1"); 
```

---

## `await getAll(table)`

The method returns absolutely all records from the specified table.

### Example

```javascript
let data = await indb.getAll("songs");
```

---

## `tokens(string)`

A helper method. It converts a string into an array of words (tokens). It removes punctuation, leaving only letters and numbers. This is useful for creating search indexes with `multiEntry: true`.

### Example

```javascript
let a = indb.tokens("hello, world!");
console.log(a); // ["hello", "world"]
```

---

## `await search(table, index, value, op = "and")`

The method performs a full-text search on the table (using tokenization).
A string of words is passed as `value`.

The method accepts an optional fourth parameter `op` (search logic):
- `"and"` (default): the record must contain **all** words from the query (intersection).
- `"or"`: the record must contain **at least one** word from the query (union).

### Example

```javascript
// Finds records containing BOTH "My" AND "super" AND "song"
let strictSearch = await indb.search("songs", "title", "My super song", "and"); 

// Finds records containing ANY of these words
let broadSearch = await indb.search("songs", "title", "rock metal", "or");
```

**Note:** Automatic tokenization of the query string is performed inside the method. The developer does not need to call `tokens()` manually. If you need exact phrase matching (without splitting into words), use `findBy` or `findAll` instead.

---

## `await select(obj)`

A universal method for data selection supporting pagination and sorting (uses cursors). Accepts a parameter object:

- **table** — Table name (mandatory).
- **index** — Index name (optional, if not searching by primary key).
- **value** — Search value (applied only with index).
- **offset** — How many records to skip.
- **limit** — How many records to return.
- **direction** — Sort direction (`next` or `prev`).

The `value` parameter can be a string or a range (IDBKeyRange object).

**Range Examples:**
```javascript
{
    value: "hello" // Exact match
}
// or
{
    value: { start: 1, end: 5 } // Range: e.g., from 1 to 5 years
}
```

### Query Example

```javascript
let querySelect = await indb.select({
    table: "users",
    index: "shop",      // Search by 'shop' index
    value: "Kaufland",  // Value: Kaufland
    offset: 10,         // Skip the first 10 found
    limit: 10,          // Return the next 10
    direction: "prev"   // Reverse order sorting
});
```

---

## `await remove(obj)`

Method for bulk record deletion. Accepts the same parameter object as `select` (allows deleting a range of data or data by filter).

---

## `await count(obj)`

The method returns the number of records matching the query. The parameter object is identical to the `select` method.