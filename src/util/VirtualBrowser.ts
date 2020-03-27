import { Page } from "puppeteer";
import Bottleneck from "bottleneck";

export class VirtualBrowser {
    private bottleneck: Bottleneck;

    constructor(private currentPage: Page) {
        this.bottleneck = new Bottleneck({
            maxConcurrent: 1,
            minTime: 400
        });
    }

    /**
     * Sleep for a duration
     * @param duration
     */
    public sleep(duration: number) {
        return this.bottleneck.schedule(() => this.currentPage.waitFor(duration));
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
            return this.currentPage.$eval(selector, (element, value) => {
                if (element instanceof HTMLInputElement) {
                    element.value = value;
                }
            }, value);
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
