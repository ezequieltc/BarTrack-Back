const { Client } = require('pg');

async function testConnection(user) {
    const connectionString = `postgres://${user}:31649618@localhost:5432/bartrack`;
    console.log(`Testing with user: ${user}`);
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Successfully connected!');
        await client.end();
        return true;
    } catch (err) {
        console.error('Connection failed:', err.message);
        await client.end();
        return false;
    }
}

async function run() {
    // Try provided user
    if (await testConnection('postgresql')) return;
    // Try standard user
    if (await testConnection('postgres')) return;
}

run();
