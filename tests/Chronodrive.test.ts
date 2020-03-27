import { Chronodrive } from "../src/Chronodrive";
import { Substitute, Arg } from "@fluffy-spoon/substitute";
import { VirtualBrowser } from "../src/util/VirtualBrowser";

describe('Chronodrive', () => {
    const virtualBrowser = Substitute.for<VirtualBrowser>();
    const chronodrive = new Chronodrive(virtualBrowser);

    it('should select the correct store', () => {
        virtualBrowser.goto('https://www.chronodrive.com/prehome').resolves(null);
        virtualBrowser.input('#searchField', 'dummyStore').resolves();
        virtualBrowser.clickOn('#linksubmit').resolves();
        virtualBrowser.clickOn('#resultZone > ul > li:nth-child(1) > div.actions-btn > a:nth-child(2)').resolves();

        return chronodrive.selectStore('dummyStore');
    });

    it('should connect to account', () => {
        virtualBrowser.goto('https://www.chronodrive.com/login').resolves(null);
        virtualBrowser.input('#email_login', 'dummyuser').resolves();
        virtualBrowser.input('#pwd_login', 'dummypass').resolves();
        virtualBrowser.clickOn('#loginForm > button').resolves();

        return chronodrive.connect('dummyuser', 'dummypass');
    });

    it('should check state', () => {
        virtualBrowser.refresh().resolves();
        virtualBrowser.eval(Arg.any()).returns();

        return chronodrive.check_state().then((value) => {
            console.log(value);
            if (value) {
                return Promise.resolve();
            } else {
                return Promise.reject("Doesn't work");
            }
        })
    })
});
