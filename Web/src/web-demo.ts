import { API, webRequestHandler } from '@onslip/onslip-360-web-api';

export async function main() {
    API.initialize(webRequestHandler({}));

    try {
        // Create an API instance (realm = company alias; key = base64-encoded Hawk key)
        const api = new API('https://test.onslip360.com/v1/', '<realm>', 'key:<username>+<keyname>@<realm>', '<key>');

        document.getElementById('me')!.innerText = JSON.stringify(await api.getClientInfo());

        // Display all product groups, sorted by name

        for (const pg of await api.listProductGroups('', 'name')) {
            document.getElementById('pg')!.innerText += `  ${pg.name}, created on ${new Date(pg.created)}\n`;
        }

        // Find all products -- even deleted products -- that cost more than 20 (kr) and has been modified since last month
        const last_month = new Date(Date.now() - 30*24*60*60*1000);

        for (const product of await api.listProducts(`updated>"${last_month.toISOString()}" AND price>20`, 'name', 0, -1, true, '')) {
            document.getElementById('products')!.innerText += `  ${product.name}: ${product.price} kr ${product.deleted ? `(deleted on ${new Date(product.deleted as string)})` : ""}\n`;
        }

        const location = (await api.listLocations())[0];

        if (location) {
            const file   = document.getElementById('file') as HTMLInputElement;
            const upload = document.getElementById('upload') as HTMLButtonElement;

            upload.addEventListener('click', async () => {
                if (file.files && file.files[0]) {
                    console.log(`Uploading ${file.files[0]}`);
                    await api.uploadLocationCustomerScreenLogo(location.id, file.files[0] as unknown as API.DataStream);
                    await displayCustomerScreenLogo(api, location.id);
                }
            }, false);

            await displayCustomerScreenLogo(api, location.id);
        }

        // Now stream all product and product-group modifications
        const stream = await api.addEventStream({ state: 'pending', queries: [ { resource: 'products', query: '' }, { resource: 'product-groups', query: '' } ] });
        const cancel = new AbortController();
        setTimeout(() => cancel.abort(), 60_000);

        for await (const event of api.signal(cancel.signal).openEventStream(stream.id)) {
            document.getElementById('events')!.innerText += JSON.stringify(event) + '\n';
        }
        document.getElementById('events')!.innerText += 'All done; stream closed';
    }
    catch (err) {
        alert(`Error: ${err}`);
    }
}

async function displayCustomerScreenLogo(api: API, location: number) {
    const logo = await api.downloadLocationCustomerScreenLogo(location);

    console.log(`Downloaded file '${logo.name ||''}' (${logo.type}, ${logo.size} bytes long)`)

    // Display logo
    const image = document.getElementById('logo') as HTMLImageElement;
    image.src = URL.createObjectURL(logo as Blob);
    image.onload = () => URL.revokeObjectURL(image.src);

    // Also read stream manually just for demo
    const reader = (logo.stream() as ReadableStream<Uint8Array>).getReader();

    for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
        console.log(`Read chunk; size=${chunk.value.length}`);
    }
}
