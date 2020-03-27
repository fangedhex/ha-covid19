const debug = require("debug")("ha-covid19:chronodrive");
import { VirtualBrowser } from "./util/VirtualBrowser";
import Bottleneck from "bottleneck";

export class Chronodrive {
    private bottleneck: Bottleneck;

    constructor(private virtualBrowser: VirtualBrowser) {
        this.bottleneck = new Bottleneck({
            minTime: 20000,
            maxConcurrent: 1
        });
    }

    /**
     * Select the first store with the search term provided
     * @param search_term
     */
    public selectStore(search_term: string) {
        return this.virtualBrowser.goto('https://www.chronodrive.com/prehome')
            .then((response) => {
                if (!response || response.status() != 200) {
                    throw "Chronodrive is not responding.";
                }
                return this.virtualBrowser.input('#searchField', search_term);
            })
            .then(() => this.virtualBrowser.clickOn('#linksubmit'))
            .then(() => {
                const selector = '#resultZone > ul > li:nth-child(1) > div.actions-btn > a:nth-child(2)';
                return this.virtualBrowser.clickOn(selector);
            })
            .then(() => {
                debug("Chrono drive selected.");
                return true;
            })
            .catch(() => {
                debug("Something bad happened while selecting Chronodrive location.");
                return false;
            });
    }

    public connect(username: string, password: string) {
        return this.virtualBrowser.goto('https://www.chronodrive.com/login')
            .then(() => this.virtualBrowser.input('#email_login', username))
            .then(() => this.virtualBrowser.input('#pwd_login', password))
            .then(() => {
                debug("Connecting to Chronodrive account finished.");
                return this.virtualBrowser.clickOn('#loginForm > button')
            });
    }

    public check_state() {
        return this.bottleneck.schedule(() => {
            debug("Refreshing the page");
            return this.virtualBrowser.refresh();
        })
            .then(() => this.virtualBrowser.eval('#m_panier > div.dispo.dispo--added', (element) => {
                return element.innerHTML;
            }))
            .then((message) => {
                if (message) {
                    debug("Status : " + message);
                    return !message.includes("Pas de créneau disponible");
                } else {
                    return undefined;
                }
            });
    }
}
