require('dotenv').config()
console.dir(process.env);
module.exports = {
    development: {
        client: "pg",
        connection: {
            database: process.env.PG_DATABASE,
            user: process.env.PG_USER,
            host: process.env.PG_HOST
        },
        migrations: {
            tableName: "knex_migrations"
        }
    },

    production: {
        client: "pg",
        connection: {
            database: process.env.PG_DATABASE,
            user: process.env.PG_USER,
            host: process.env.PG_HOST
        },
        migrations: {
            tableName: "knex_migrations"
        }
    }

};