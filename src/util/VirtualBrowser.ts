import { Browser, Page, launch } from "puppeteer";
import { CHROMIUM_OPTS } from "../env.config";
import Bottleneck from "bottleneck";

export class VirtualBrowser {
    private bottleneck!: Bottleneck;
    private chromium!: Browser;
    private currentPage!: Page;

    private checkVars() {
        return (async () => {
            this.bottleneck = new Bottleneck({
                maxConcurrent: 1,
                minTime: 300
            });

            this.chromium = await launch({
                args: CHROMIUM_OPTS
            });

            this.currentPage = await this.chromium.newPage();

            return Promise.resolve();
        }).bind(this)();
    }

    /**
     * Goto to an url
     * @param url
     */
    public goto(url: string) {
        return this.bottleneck.schedule(() => this.checkVars())
            .then(() => this.currentPage.goto(url));
    }

    /**
     * Change an input element's value inside the current page
     * @param selector
     * @param value
     */
    public input(selector: string, value: string) {
        return this.bottleneck.schedule(() => this.checkVars())
            .then(() => {
                return this.currentPage.$eval(selector, (element) => {
                    if (element instanceof HTMLInputElement) {
                        element.value = value;
                    }
                });
            });
    }

    /**
     * Call $eval on the browser
     * @param selector
     * @param pageFunction
     */
    public eval<R>(selector: string, pageFunction: (element: Element) => R | Promise<R>) {
        return this.bottleneck.schedule(() => this.checkVars())
            .then(() => {
                return this.currentPage.$eval(selector, pageFunction);
            })
    }

    /**
     * Simulate a click on an element of the current page
     * @param selector
     */
    public clickOn(selector: string) {
        return this.bottleneck.schedule(() => this.checkVars())
            .then(() => {
            return this.currentPage.click(selector);
        })
    }

    /**
     * Refresh the current page
     */
    public refresh() {
        return this.bottleneck.schedule(() => this.checkVars())
            .then(() => this.currentPage.reload());
    }
}
