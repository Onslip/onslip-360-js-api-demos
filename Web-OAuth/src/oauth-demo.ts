import { API, oauthPKCE, url } from '@onslip/onslip-360-api';
import { webRequestHandler } from '@onslip/onslip-360-web-api';
import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";

interface OAuthState {
    cv:     string;
    server: string;
    client: string;
}

@customElement("oauth-demo")
export class OAuthDemo extends LitElement {
    @query("#servers") private serversEl!: HTMLSelectElement;
    @query("#server") private serverEl!: HTMLInputElement;
    @query("#client") private clientEl!: HTMLInputElement;

    @state() private server = 'https://test.onslip360.com';
    @state() private client = 'oauth-demo';
    @state() private result = 'N/A';
    @state() private api: API | null = null;
    @state() private location: number | undefined;

    override render() {
        return html`
            <h1>Onslip 360 OAuth Demo</h1>

            ${!this.api ? html`
                <h2>Authorization</h2>

                <label>Server:</label>

                <select id=servers @change=${this.selectServer}>
                    <option value="https://test.onslip360.com">Test/SE</option>
                    <option value="https://api.onslip360.com">Prod/SE</option>
                    <option value="">Custom</option>
                </select>

                <input id=server type=text size="40" placeholder="Server URL" value=${this.server} @input=${this.updateServer} />
                <input id=client type=text size="10" placeholder="Client ID"  value=${this.client} @change=${this.updateClient} />

                <button ?disabled=${!this.server || !this.click} @click=${this.authorize}>Authorize</button>
            ` : html`
                <h2>API Demos</h2>

                <button @click=${this.unauthorize}>Unauthrorize</button>
                <button @click=${this.clientInfo}>Client Info</button>
                <button @click=${this.getLocation}>Location Info</button>

                <h3>Result</h2>
                <pre id=result>${this.result}</pre>
            `}
        `;
    }

    override async firstUpdated() {
        // First, check for OAuth redirect callback params after authorization
        if (window.location.search) {
            const qp = new URLSearchParams(window.location.search);
            const sn = `oauth-demo-state-${qp.get('state')}`;
            const ls = JSON.parse(sessionStorage.getItem(sn) ?? 'null') as OAuthState | null;

            history.replaceState(history.state, document.title, location.href.replace(/\?.*$/, ''));
            sessionStorage.removeItem(sn);

            this.serverEl.value = ls?.server ?? '';
            this.clientEl.value = ls?.client ?? '';
            this.updateServer();
            this.updateClient();

            if (qp.has('error')) {
                alert(`Error ${qp.get('error')}: ${qp.get('error_description')}\n\n${qp}`);
            } else if (qp.has('code')) {
                if (!ls) {
                    alert(`Invalid state: ${qp.get('state')}`);
                } else {
                    const v1 = new URL('/v1/', ls.server).href;
                    const at = await new API(v1, '', '', '').requestHandler(webRequestHandler({})).requestOAuthAccessToken({
                        client_id:     this.client,
                        grant_type:    'authorization_code',
                        redirect_uri:  window.location.href,
                        code:          qp.get('code')!,
                        code_verifier: ls.cv,
                    });

                    sessionStorage.setItem(`oauth-demo-access-token`, JSON.stringify({ at, v1 }));
                }
            }
        }

        // Second, if we have an access token, initialize the API

        const token = JSON.parse(sessionStorage.getItem(`oauth-demo-access-token`) ?? 'null') as { at: API.OAuthAccessTokenResponse, v1: string } | null;

        if (token) {
            this.location = token.at.location;

            this.api = new API(token.v1, token.at.realm, token.at.access_token, btoa(token.at.secret))
                .requestHandler(webRequestHandler({}));
        }
    }

    private selectServer() {
        this.serverEl.value = this.serversEl.value;
        this.updateServer();
    }

    private updateServer() {
        this.serversEl.value = this.server = this.serverEl.value;
        this.serversEl.value ||= '';
    }

    private updateClient() {
        this.client = this.clientEl.value;
    }

    private async showResult<T>(fn: () => T | Promise<T>) {
        this.result = JSON.stringify(await Promise.resolve(fn()).catch((e) => e), null, 4);
    }

    private async authorize() {
        const redirect_uri = window.location.href;
        const state        = crypto.randomUUID();
        const [ cc, cv ]   = await oauthPKCE();
        const auth_query   = url`?response_type=code&client_id=${this.client}&redirect_uri=${redirect_uri}&state=${state}&code_challenge=${cc}&code_challenge_method=S256`;

        sessionStorage.setItem(`oauth-demo-state-${state}`, JSON.stringify({ cv, server: this.server, client: this.client } satisfies OAuthState));
        window.location.href = `${this.serverEl.value}/oauth-authorization/${auth_query}`;
    }

    private unauthorize() {
        sessionStorage.removeItem(`oauth-demo-access-token`);
        this.api = null;
    }

    private async clientInfo() {
        this.showResult(() => this.api?.getClientInfo());
    }

    private async getLocation() {
        this.showResult(() => this.api?.getLocation(this.location!));
    }
}
