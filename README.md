# ScreenReaderBridge
A simple interface for making a variety of screen reader and browser combinations speak using an ARIA live region.

## Description

This package contains a single TypeScript class which handles manipulating an ARIA live region so that screen reading software will read out the text when desired. It will work with a number of different screen readers, screen reader versions, and browsers. The class includes a static method which will automatically configure the correct ARIA tags so things work as they should.

This does not create audio to play using the WebAudioAPI, nor does it use the WebSpeechAPI. The end-user must have a screen reader (e.g. Jaws, NVDA, VoiceOver, etc.) running to hear any output.

## Useage

```js
// Create or get a "div" element which will be used as the region.
let divElement = document.getElementById("MyDiv");
// Apply the ARIA attributes automatically.
ScreenReaderBridge.addAriaAttributes(divElement);
// Create the ScreenReaderBridge object.
let srb = new ScreenReaderBridge(divElement);
// Call srb.render to have screen readers speak the text.
srb.render("Hello, World!");
```

## API notes

Here is a list of attributes and methods available on the ScreenReaderBridge object in TypeScript notation.

```ts
/**
 * A class that will handle passing text to screen readers to speak.
 * When a user of this class passes in a "caption" element, the renderer will add a child element to the caption for
 * each string that the screen reader should speak. The renderer will also remove old child nodes when a new string is
 * spoken.
 * The "caption" element must have a specific list of aria attributes to properly work, see the static method
 * "addAriaAttributes" for more details.
*/
declare class ScreenReaderBridge {

    /**
     * Automatically add the required aria attributes to an element for screen readers to properly work.
     * In order for the greatest number of screen reader and browser combinations to work, the following attributes will
     * be set on the element:
     * aria-live: assertive
     * roll: status
     * aria-atomic: true
     * aria-relevant: additions text
     *   For the aria-live attribute, "polite" may also work, but that will create a queue of messages for the screen
     *   reader to read out one after another which is probably not what you want.
     *
     * @param element - the "caption" element which will host the messages for the screen reader to speak
     * @param [ariaLive="assertive"] - the politeness of the aria-live attribute, one of "off", "assertive", or "polite"
     * @static
    */
    static addAriaAttributes(element: HTMLElement, ariaLive?: string): void;

    /**
     * Create a ScreenReaderBridge instance.
     *
     * @param captionElement - the "caption" element, typically a span or div element
    */
    constructor(captionElement: HTMLElement);

    /**
     * The last created child element of the "caption" element.
     * This is typically used for debugging and automated testing.
    */
    get lastCreatedElement(): HTMLElement | null;

    /**
     * Clear the contents of the live region.
     * You normally do not have to call this yourself since calls to the render method will automatically clean up old text.
    */
    clear(): void;

    /**
     * Speak the provided text.
     *
     * @param text - the text to speak
    */
    render(text: string): void;
}
```

## Contributing and building from source

Download/clone this repository. To install needed packages and build, run the following:
```bash
npm install
npm run build
```

When you want to clean your workspace, run the following:
```bash
npm run clean
```

Contributions and bug reports are very welcome via pull requests and opening issues.