import { ScreenReaderBridge } from "../src";

describe("ScreenReaderBridge", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
        jest.spyOn(Date, "now").mockReturnValue(1_000);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("adds the ARIA attributes needed for a live status region", () => {
        const element = document.createElement("div");

        ScreenReaderBridge.addAriaAttributes(element);

        expect(element.getAttribute("aria-live")).toBe("assertive");
        expect(element.getAttribute("role")).toBe("status");
        expect(element.getAttribute("aria-atomic")).toBe("true");
        expect(element.getAttribute("aria-relevant")).toBe("additions text");
    });

    it("allows the ARIA live politeness to be configured", () => {
        const element = document.createElement("div");

        ScreenReaderBridge.addAriaAttributes(element, "polite");

        expect(element.getAttribute("aria-live")).toBe("polite");
    });

    it("renders messages into new child elements and tracks the original text", () => {
        const captionElement = document.createElement("div");
        const bridge = new ScreenReaderBridge(captionElement, "span");

        bridge.render("Hello");

        expect(captionElement.children).toHaveLength(1);
        expect(captionElement.firstElementChild?.tagName).toBe("SPAN");
        expect(captionElement.firstElementChild?.textContent).toBe("Hello");
        expect(
            captionElement.firstElementChild?.getAttribute(
                ScreenReaderBridge.ORIGINAL_TEXT_ATTRIBUTE
            )
        ).toBe("Hello");
        expect(bridge.lastCreatedElement).toBe(captionElement.firstElementChild);
    });

    it("accepts constructor options for the generated child element type", () => {
        const captionElement = document.createElement("div");
        const bridge = new ScreenReaderBridge(captionElement, {
            childElementType: "span"
        });

        bridge.render("Hello");

        expect(captionElement.firstElementChild?.tagName).toBe("SPAN");
    });

    it("can configure ARIA attributes from constructor options", () => {
        const captionElement = document.createElement("div");

        new ScreenReaderBridge(captionElement, {
            configureElement: true,
            politenessLevel: "polite"
        });

        expect(captionElement.getAttribute("aria-live")).toBe("polite");
        expect(captionElement.getAttribute("role")).toBe("status");
        expect(captionElement.getAttribute("aria-atomic")).toBe("true");
        expect(captionElement.getAttribute("aria-relevant")).toBe(
            "additions text"
        );
    });

    it("pads repeated messages so screen readers treat them as changed text", () => {
        const captionElement = document.createElement("div");
        const bridge = new ScreenReaderBridge(captionElement);

        bridge.render("Repeat");
        bridge.render("Repeat");
        bridge.render("Repeat");

        expect(
            Array.from(captionElement.children).map(
                (child) => child.textContent
            )
        ).toEqual(["Repeat", "Repeat\u00A0", "Repeat\u00A0\u00A0"]);
    });

    it("hides replaced messages and removes hidden messages after the delay", () => {
        const captionElement = document.createElement("div");
        const bridge = new ScreenReaderBridge(captionElement);

        bridge.render("First");
        jest.spyOn(Date, "now").mockReturnValue(1_010);
        bridge.render("Second");

        expect(captionElement.children).toHaveLength(2);
        expect((captionElement.children[0] as HTMLElement).style.display).toBe(
            "none"
        );

        jest.spyOn(Date, "now").mockReturnValue(1_020);
        bridge.render("Third");

        expect(captionElement.children).toHaveLength(3);

        jest.spyOn(Date, "now").mockReturnValue(1_040);
        bridge.render("Fourth");

        expect(
            Array.from(captionElement.children).map((child) =>
                child.getAttribute(
                    ScreenReaderBridge.ORIGINAL_TEXT_ATTRIBUTE
                )
            )
        ).toEqual(["Second", "Third", "Fourth"]);
    });

    it("clears rendered content", () => {
        const captionElement = document.createElement("div");
        const bridge = new ScreenReaderBridge(captionElement);

        bridge.render("Message");
        bridge.clear();

        expect(captionElement.children).toHaveLength(0);
        expect(bridge.lastCreatedElement).toBeNull();
    });
});
