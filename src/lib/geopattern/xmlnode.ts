export default class XmlNode {
    private readonly tagName: string;
    private readonly attributes: Record<string, string | number>;
    private readonly children: XmlNode[];

    public constructor(tagName: string) {
        this.tagName = tagName;
        this.attributes = Object.create(null);
        this.children = [];
    }

    public get lastChild(): XmlNode | undefined {
        return this.children[this.children.length - 1];
    }

    public appendChild(child: XmlNode): void {
        this.children.push(child);
    }

    public setAttribute(name: string, value: string | number): void {
        this.attributes[name] = value;
    }

    public toString(): string {
        return [
            `<${this.tagName}${Object.keys(this.attributes).map(attr => ` ${attr}="${this.attributes[attr]}"`).join("")}>`,
            this.children.map(child => child.toString()).join(""),
            `</${this.tagName}>`,
        ].join("");
    }
}
