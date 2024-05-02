export class customButton extends HTMLElement {
    constructor() {
        super();
        this.text;
        this.backgroundColor
        this.color;
        this.navigate;

    }
    static get observedAttributes() {
        return ["color", "background-color", "text", "navigate"];
    }

    attributeChangedCallback(atribute, oldValue, newValue) {
        switch (atribute) {
            case "color":
                this.color = newValue;
                break;
            case "background-color":
                this.backgroundColor = newValue;
                break;
            case "text":
                this.text = newValue;
                break;
            case "navigate":
                this.navigate = newValue;
                break;
        }
    }

    connectedCallback() {
        this.innerHTML = `
        <a href="${this.navigate}"><button 
        style="background-color: ${this.backgroundColor}; color:${this.color}; border: solid 1px white; padding:10px 14px; border: none; border-radius: 4px; cursor: pointer;">
        ${this.text}
        </button></a>
        </br>`;

    }

}

window.customElements.define('custom-button', customButton);