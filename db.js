const knex = require('knex');

const db = knex({
    client: 'better-sqlite3',
    connection: {
        filename: './account.db'
    },
    useNullAsDefault: true
});
db.raw('PRAGMA journal_mode = WAL;').then(result => {
    db.raw('PRAGMA journal_mode;').then(console.log).catch(console.error);
}).catch(console.error);
db.raw('PRAGMA synchronous = NORMAL;').then(result => {
    db.raw('PRAGMA synchronous;').then(console.log).catch(console.error);
}).catch(console.error);
db.raw('PRAGMA journal_size_limit = 6144000;').then(result => {
    db.raw('PRAGMA journal_size_limit;').then(console.log).catch(console.error);
}).catch(console.error);


(async () => {
    try {
        const tableName = 'accounts';
        // Create the table if it doesn't exist
        await db.schema.createTableIfNotExists(tableName, (table) => {
            table.integer('account_no').notNullable(); // account_no column
            table.decimal('balance').notNullable().defaultTo(0); // balance column
            table.primary(['account_no']); // Primary key
            table.check('balance >= 0'); // CHECK constraint
            table.timestamps(true, true);
        });
        console.log(`Table '${tableName}' created successfully.`);
        // Destroy the connection
        // await db.destroy();
    } catch (error) {
        console.error(error);
    }
})();

module.exports = db;