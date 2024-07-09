export default class XMLNode {
    private tagName: string;
    private attributes: { [key: string]: string | number };
    private children: XMLNode[];

    public constructor(tagName: string) {
        this.tagName = tagName;
        this.attributes = Object.create(null);
        this.children = [];
    }

    public get lastChild() {
        return this.children[this.children.length - 1];
    }

    public appendChild(child: XMLNode) {
        this.children.push(child);
    }

    public setAttribute(name: string, value: string | number) {
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
