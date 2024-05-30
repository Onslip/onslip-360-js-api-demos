
import { SysConsole } from '@divine/sysconsole';
import { API, nodeRequestHandler, AbortController } from '@onslip/onslip-360-node-api';
import pkg from '../package.json';

SysConsole.replaceConsole({ showFile: false });
API.initialize(nodeRequestHandler({ userAgent: `${pkg.name}/${pkg.version}` }));

async function main() {
    try {
        // Create an API instance (realm = company alias; key = base64-encoded Hawk key)
        const api = new API('https://test.onslip360.com/v1/', '<realm>', 'key:<username>+<keyname>@<realm>', '<key>');

        console.log('Me:', await api.getClientInfo());

        // Display all product groups, sorted by name
        console.log('All product groups:');

        for (const pg of await api.listProductGroups('', 'name')) {
            console.log(`  ${pg.name}, created on ${new Date(pg.created)}`);
        }

        // Find all products -- even deleted products -- that cost more than 20 (kr) and has been modified since last month
        console.log('Products costing more than 20 kr and recently updated:');

        const last_month = new Date(Date.now() - 30*24*60*60*1000);

        for (const product of await api.listProducts(`updated>"${last_month.toISOString()}" AND price>20`, 'name', 0, -1, true, '')) {
            console.log(`  ${product.name}: ${product.price} kr ${product.deleted ? `(deleted on ${new Date(product.deleted as string)})` : ""}`);
        }

        // Now stream all product and product-group modifications (for one minute)
        const stream = await api.addEventStream({ state: 'pending', queries: [ { resource: 'products', query: '' }, { resource: 'product-groups', query: '' } ] });
        const cancel = new AbortController();
        setTimeout(() => cancel.abort(), 60_000);

        console.log('Product and product group updates:');
        for await (const event of api.signal(cancel.signal).openEventStream(stream.id)) {
            console.log(event);
        }
        console.log('All done; stream closed');
    }
    catch (err) {
        console.error(`Error: ${err}`);
    }
}

main();
