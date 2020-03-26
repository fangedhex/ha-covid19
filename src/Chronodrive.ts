const debug = require("debug")("ha-covid19:chronodrive");
import { VirtualBrowser } from "./util/VirtualBrowser";
import Bottleneck from "bottleneck";

export class Chronodrive {
    private bottleneck: Bottleneck;

    constructor(private virtualBrowser: VirtualBrowser) {
        this.bottleneck = new Bottleneck({
            minTime: 5000,
            maxConcurrent: 1
        });
    }

    /**
     * Select the first store with the search term provided
     * @param search_term
     */
    public selectStore(search_term: string) {
        return this.virtualBrowser.goto('https://www.chronodrive.com/')
            .then(() => this.virtualBrowser.input('#searchField', search_term))
            .then(() => this.virtualBrowser.clickOn('#linksubmit'))
            .then(() => {
                debug("Selection du magasin terminée.");
                const selector = '#resultZone > ul > li:nth-child(1) > div.actions-btn > a:nth-child(2)';
                return this.virtualBrowser.clickOn(selector);
            });
    }

    public connect(username: string, password: string) {
        return this.virtualBrowser.goto('https://www.chronodrive.com/login')
            .then(() => this.virtualBrowser.input('#email_login', username))
            .then(() => this.virtualBrowser.input('#pwd_login', password))
            .then(() => this.virtualBrowser.clickOn('#loginForm > button'));
    }

    public check_state() {
        return this.bottleneck.schedule(() => this.virtualBrowser.refresh())
            .then(() => this.virtualBrowser.eval('#m_panier > div.dispo.dispo--added', (element) => {
                if (element instanceof HTMLDivElement) {
                    return element.innerText;
                }
            }))
            .then((message) => {
                if (message) {
                    debug("Status : " + message);
                    return message != "Pas de créneaux disponibles";
                } else {
                    return Promise.reject();
                }
            });
    }
}
