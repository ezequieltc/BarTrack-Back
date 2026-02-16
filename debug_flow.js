async function runFlow() {
    const BASE_URL = 'http://localhost:3000/api';

    // 1. Get a product ID
    console.log('1. Fetching Products...');
    const pRes = await fetch(`${BASE_URL}/products`);
    const products = await pRes.json();
    if (products.length === 0) {
        console.error('No products found. Seed database first.');
        return;
    }
    const product = products[0];
    console.log(`   Using Product: ${product.name} (ID: ${product.id})`);

    // 2. Open Table 1
    console.log('2. Opening Table 1...');
    // Ensure it's free first?
    // We assume it is free based on previous debug.
    const openRes = await fetch(`${BASE_URL}/tables/1/open`, { method: 'POST' });
    const session = await openRes.json();
    if (openRes.status !== 200) {
        console.error('   Failed to open table:', session);
        return;
    }
    console.log(`   Table Opened. Session ID: ${session.id}`);

    // 3. Add Order
    console.log('3. Adding Order...');
    const orderBody = {
        items: [{ productId: product.id, quantity: 2 }]
    };
    const orderRes = await fetch(`${BASE_URL}/orders/table/1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderBody)
    });
    const orderJson = await orderRes.json();
    if (orderRes.status !== 200) {
        console.error('   Failed to add order:', orderJson);
        return;
    }
    console.log(`   Order Added.`, orderJson);

    const tablesRes = await fetch(`${BASE_URL}/tables`);
    const tablesEnv = await tablesRes.json();
    console.log('Tables Response Type:', Array.isArray(tablesEnv) ? 'Array' : typeof tablesEnv);
    if (!Array.isArray(tablesEnv) && tablesEnv.debug) {
        console.log('Server is running NEW code (Debug enabled)');
    } else {
        console.log('Server is running OLD code');
    }

    const tables = Array.isArray(tablesEnv) ? tablesEnv : tablesEnv.data;
    const t1 = tables.find(t => t.id === 1);
    console.log(`   Table 1 Status: ${t1.status}`);
    console.log(`   Current Session Orders: ${t1.currentSession?.orders?.length}`);

    // 5. Close Table
    console.log('5. Closing Table (Generating PDF)...');
    const closeRes = await fetch(`${BASE_URL}/tables/1/close`, { method: 'POST' });

    if (closeRes.status === 200) {
        const blob = await closeRes.blob();
        console.log(`   Success! Received PDF blob of size: ${blob.size} bytes`);
    } else {
        const errText = await closeRes.text();
        console.error(`   Failed to close table. Status: ${closeRes.status}`);
        console.error(`   Error Response: ${errText}`);
    }

    // 6. Check Orders Endpoint
    console.log('6. Checking /api/orders...');
    const allOrdersRes = await fetch(`${BASE_URL}/orders`);
    const allOrders = await allOrdersRes.json();
    console.log(`   Total Orders: ${allOrders.length}`);
    if (allOrders.length > 0) {
        console.log(`   First Order ID: ${allOrders[0].id}, Items: ${allOrders[0].items?.length}`);
    }

    // 7. Check Invoices Endpoint
    console.log('7. Checking /api/invoices...');
    const invoicesRes = await fetch(`${BASE_URL}/invoices`);
    const invoicesJson = await invoicesRes.json();
    console.log(`   Total Sales: ${invoicesJson.totalSales}`);
    console.log(`   Total Invoices (Sessions): ${invoicesJson.sessions?.length}`);
}

runFlow();
