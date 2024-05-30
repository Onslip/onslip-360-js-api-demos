# Onslip 360 JavaScript/TypeScript API Demos

Please visit the [Onslip 360 Developer Site](https://developer.onslip360.com/) for more information regarding the API.

## NodeJS and Web

This is a simple JavaScript/TypeScript demo of the Onslip 360 SDK. Instructions:

1. Log in to your Onslip Backoffice account at <https://test.onslip360.com>.
2. From the top right menu, select *API Keys*.
3. Press *Generate Key*, give it a name and alias, specify permissions and generate the key.
4. Insert the generated key into [node-demo.ts](NodeJS/src/node-demo.ts) and/or [web-demo.ts](Web/src/web-demo.ts).
5. Open a terminal and type `make all` to build the files.
6. The NodeJS example can be run with `node ./NodeJS` and to try the web demo, open [Web/index.html](Web/index.html) in
   a browser.

## Web-OAuth

Demonstrates how to use the Onslip 360 API with an access token acquired via the [OAuth Authorization Code
Flow](https://developer.onslip360.com/docs/api-users-guide/general-api-features/oauth).

Just start a development server with `make dev`, press `o` to open the browser and then click `Authorize` to get an
access token.
