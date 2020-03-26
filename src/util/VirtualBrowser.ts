import { Browser, Page, launch } from "puppeteer";
import { CHROMIUM_OPTS } from "../env.config";
import Bottleneck from "bottleneck";

export class VirtualBrowser {
    private bottleneck: Bottleneck;

    constructor(private currentPage: Page) {
        this.bottleneck = new Bottleneck({
            maxConcurrent: 1,
            minTime: 300
        });
    }

    /**
     * Goto to an url
     * @param url
     */
    public goto(url: string) {
        return this.bottleneck.schedule(() => this.currentPage.goto(url));
    }

    /**
     * Change an input element's value inside the current page
     * @param selector
     * @param value
     */
    public input(selector: string, value: string) {
        return this.bottleneck.schedule(() => {
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
        return this.bottleneck.schedule(() => {
            return this.currentPage.$eval(selector, pageFunction);
        })
    }

    /**
     * Simulate a click on an element of the current page
     * @param selector
     */
    public clickOn(selector: string) {
        return this.bottleneck.schedule(() => {
            return this.currentPage.click(selector);
        })
    }

    /**
     * Refresh the current page
     */
    public refresh() {
        return this.bottleneck.schedule(() => this.currentPage.reload());
    }
}
