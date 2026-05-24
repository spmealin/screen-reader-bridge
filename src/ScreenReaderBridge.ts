/**
 * The supported politeness levels for the live region.
 */
export type ScreenReaderBridgePolitenessLevel = "off" | "polite" | "assertive";

/**
 * The supported element types for generated message children.
 */
export type ScreenReaderBridgeChildElementType = "div" | "span";

/**
 * Options for creating a ScreenReaderBridge instance.
 */
export interface ScreenReaderBridgeOptions {
    /**
     * The type of element used for generated message children.
     */
    childElementType?: ScreenReaderBridgeChildElementType;

    /**
     * Whether to automatically apply the required ARIA attributes to the caption element.
     */
    configureElement?: boolean;

    /**
     * The politeness level used when configureElement is true.
     */
    politenessLevel?: ScreenReaderBridgePolitenessLevel;
}

/**
 * A class that will handle passing text to screen readers to speak.
 * When a user of this class passes in a "caption" element, the renderer will add a child element to the caption for
 * each string that the screen reader should speak. The renderer will also remove old child nodes when a new string is
 * spoken.
 * The "caption" element must have a specific list of aria attributes to properly work, see the static method
 * "addAriaAttributes" for more details.
 */
export class ScreenReaderBridge {
    private static readonly PADDING_CHARACTER = "\u00A0"; // no-break space
    private static readonly REMOVAL_DELAY = 25; // Wait 25 ms before removing hidden elements
    private static readonly HIDDEN_AT_ATTRIBUTE = "data-hidden-at";
    public static readonly ORIGINAL_TEXT_ATTRIBUTE = "data-original-text";

    private readonly _element: HTMLElement;
    private readonly _maxNumPaddingCharacters = 3;
    private _numPaddingCharacters = 0;
    private _lastCreatedElement: HTMLElement | null;
    private readonly _childElementType: ScreenReaderBridgeChildElementType;

    /**
     * Add the required aria attributes to an element for screen readers to properly work.
     * In order for the greatest number of screen reader and browser combinations to work, the following attributes must
     * be set on the element:
     * aria-live: assertive
     * role: status
     * aria-atomic: true
     * aria-relevant: additions text
     * The default politeness level is "assertive" because most consumers use this package for messages that should be
     * announced right away. Use "polite" when messages should wait behind other screen reader output.
     * @param element - the "caption" element which will host the messages for the screen reader to speak
     * @param [politenessLevel] - the politeness level of the aria-live attribute
     * @static
     */
    public static addAriaAttributes(
        element: HTMLElement,
        politenessLevel: ScreenReaderBridgePolitenessLevel = "assertive"
    ): void {
        element.setAttribute("aria-live", politenessLevel);
        element.setAttribute("role", "status");
        element.setAttribute("aria-atomic", "true");
        element.setAttribute("aria-relevant", "additions text");
    }

    /**
     * Create a ScreenReaderBridge instance.
     * The second parameter allows you to set the type of children that will be created when messages are rendered for
     * the screen reader to speak. By default, it creates div elements, but you can switch it to span elements if you
     * really need to.
     * @param captionElement - the "caption" element, typically a span or div element
     * @param options - the child element type or options used to configure the bridge
     */
    public constructor(
        captionElement: HTMLElement,
        options:
            | ScreenReaderBridgeChildElementType
            | ScreenReaderBridgeOptions = "div"
    ) {
        const normalizedOptions =
            typeof options === "string"
                ? { childElementType: options }
                : options;

        this._element = captionElement;
        this._lastCreatedElement = null;
        this._childElementType = normalizedOptions.childElementType ?? "div";

        if (normalizedOptions.configureElement) {
            ScreenReaderBridge.addAriaAttributes(
                captionElement,
                normalizedOptions.politenessLevel
            );
        }
    }

    /**
     * The last created child element of the "caption" element.
     */
    public get lastCreatedElement(): HTMLElement | null {
        return this._lastCreatedElement;
    }

    /**
     * Clear the contents of the live region.
     */
    public clear(): void {
        this._element.innerHTML = "";
        this._lastCreatedElement = null;
    }

    /**
     * Speak the provided text.
     * @param text - the text to speak
     */
    public render(text: string): void {
        // Pad the text with the padding character.
        const paddedText = this._createPaddedText(text);
        // Create the new element.
        const childElement = document.createElement(this._childElementType);
        childElement.textContent = paddedText;
        childElement.setAttribute(
            ScreenReaderBridge.ORIGINAL_TEXT_ATTRIBUTE,
            text
        );
        childElement.setAttribute("data-created", Date.now().toString());
        // If there is a previous element, delete old elements and add it to the list to be deleted in the future.
        if (this.lastCreatedElement) {
            this._removeOldElements();
            this.lastCreatedElement.style.display = "none";
            this.lastCreatedElement.setAttribute(
                ScreenReaderBridge.HIDDEN_AT_ATTRIBUTE,
                Date.now().toString()
            );
        }
        // Show the new element with the text.
        this._element.appendChild(childElement);
        this._lastCreatedElement = childElement;
    }

    /**
     * Pad the provided text with the padding character.
     * Padding the text tricks screen readers into speaking it, even if they think it should be suppressed.
     * @param text - the text to pad
     * @private
     */
    private _createPaddedText(text: string): string {
        let padding = "";
        for (let i = 0; i < this._numPaddingCharacters; i++) {
            padding += ScreenReaderBridge.PADDING_CHARACTER;
        }
        // Increase the number of padding characters for the next call to this method.
        this._numPaddingCharacters =
            (this._numPaddingCharacters + 1) % this._maxNumPaddingCharacters;
        return text + padding;
    }

    /**
     * Remove any hidden elements that were hidden longer than the set milliseconds.
     * We wait to remove those elements even though they are hidden because some screen readers don't like the DOM
     * changing that much.
     * @private
     */
    private _removeOldElements(): void {
        // Remove old elements or add them to a list if they are too young.
        const curTime = Date.now();
        Array.from(this._element.children).forEach((kid) => {
            const hiddenAt = kid.getAttribute(
                ScreenReaderBridge.HIDDEN_AT_ATTRIBUTE
            );
            if (hiddenAt === null) {
                return;
            }

            const time = Number(hiddenAt);
            if (curTime - time > ScreenReaderBridge.REMOVAL_DELAY) {
                this._element.removeChild(kid);
            }
        });
    }
}
