export class Indb {
    constructor();

    /**
     * Initializes the database connection and schema.
     * @param database - Database name.
     * @param version - Database version.
     * @param tables - Schema configuration object.
     */
    init(database: string, version: number, tables: object): Promise<boolean>;

    /**
     * Imports data from a JSON object into the database.
     * @param json - Data object (keys are table names, values are arrays of records).
     * @param overwrite - If true, clears the table before inserting new data. Default is false.
     */
    importData(json: object, overwrite?: boolean): Promise<boolean>;

    /**
     * Exports all data from the database.
     * @returns An object containing all data from all tables.
     */
    exportData(): Promise<object>;

    /**
     * Deletes the specified database from the browser.
     * Warning: All other tabs with this site must be closed.
     */
    drop(database: string): Promise<boolean>;

    /**
     * Adds a single record or an array of records to the table.
     * @param data - Single object or array of objects.
     */
    add(table: string, data: object | object[]): Promise<any>;

    /**
     * Updates a record or creates a new one (full overwrite).
     * Warning: If fields are missing in the new object, they will be lost.
     * @param data - Single object or array of objects.
     */
    put(table: string, data: object | object[]): Promise<any>;

    /**
     * Deletes a record by its ID.
     */
    delete(table: string, id: string | number): Promise<any>;

    /**
     * Deletes multiple records by a list of IDs.
     */
    deleteMany(table: string, ids: (string | number)[]): Promise<any>;

    /**
     * Updates specific fields of an existing record (partial update).
     */
    update(table: string, id: string | number, data: object): Promise<boolean>;

    /**
     * Clears all records from the table.
     */
    clear(table: string): Promise<any>;

    /**
     * Retrieves a single record by ID.
     */
    get(table: string, id: string | number): Promise<any>;

    /**
     * Finds the first record matching the index and value.
     */
    findBy(table: string, index: string, value: any): Promise<any>;

    /**
     * Finds all records matching the index and value.
     */
    findAll(table: string, index: string, value: any): Promise<any[]>;

    /**
     * Retrieves all records from the table.
     */
    getAll(table: string): Promise<any[]>;

    /**
     * Helper method. Tokenizes a string into an array of words.
     * Removes punctuation.
     */
    tokens(string: string): string[];

    /**
     * Performs a full-text search using tokenization.
     * @param query - A string of words.
     * @param op - Search logic: 'and' (intersection) or 'or' (union). Default is 'and'.
     */
    search(table: string, index: string, query: string, op?: 'and' | 'or'): Promise<any[]>;

    /**
     * Universal method for selecting data with pagination, sorting, and filtering.
     */
    select(input: {
        table: string;
        index?: string;
        value?: any; 
        offset?: number;
        limit?: number;
        direction?: 'next' | 'prev' | 'nextunique' | 'prevunique';
    }): Promise<any>;

    /**
     * Batch deletion of records based on the query filter.
     * Accepts the same parameters as select().
     */
    remove(input: {
        table: string;
        index?: string;
        value?: any;
    }): Promise<any>;

    /**
     * Counts the number of records matching the query.
     * Accepts the same parameters as select().
     */
    count(input: {
        table: string;
        index?: string;
        value?: any;
    }): Promise<number>;
}