import {JSDOM} from 'jsdom';

const dom = new JSDOM('<html><body></body></html>');
(dom.window as any).Date = Date;
(global as any).document = dom.window.document;
(global as any).window = dom.window;
(global as any).navigator = dom.window.navigator;