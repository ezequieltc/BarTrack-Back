async function debug() {
    try {
        console.log('Fetching Tables...');
        const res = await fetch('http://localhost:3000/api/tables');
        const tables = await res.json();

        tables.forEach(t => {
            console.log(`Table ${t.number} (${t.status}):`);
            if (t.currentSession) {
                console.log(`  Session ID: ${t.currentSession.id}`);
                console.log(`  Total (DB): ${t.currentSession.totalAmount}`);
                const orders = t.currentSession.orders || [];
                console.log(`  Orders Count: ${orders.length}`);

                if (orders.length > 0) {
                    orders.forEach(o => {
                        console.log(`    Order #${o.id}:`);
                        if (o.items) {
                            o.items.forEach(i => {
                                console.log(`      - ${i.product ? i.product.name : 'Unknown Product'} (x${i.quantity})`);
                            });
                        } else {
                            console.log('      items is NULL');
                        }
                    });
                } else {
                    console.log('    (No orders in session)');
                }
            } else {
                console.log('  No current session');
            }
        });

    } catch (error) {
        console.error('Error fetching tables:', error.message);
    }
}

debug();
