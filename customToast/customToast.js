class customToast extends HTMLElement {
    constructor() {
        super();
        this.text;
        this.color;
        this.icon;
        this.backgroundColor;
        
    }

    static get observedAttributes() {
        return ["text", "color", "background", "icon"];
    }

    attributeChangedCallback(attribute, oldValue, newValue) {
        if (oldValue !== newValue) {
            switch (attribute) {
                case "text":
                    this.text = newValue;
                    break;
                case "color":
                    this.color = newValue;
                    break;
                case "background":
                    this.background = newValue;
                    break;
                case "icon":
                    this.icon = newValue;
                    break;
            }
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.classList.add('toastBox');

        this.innerHTML = `
            <div class="toast" style="background: ${this.background}">
                <img src="${this.icon}" />
                <p style="color: ${this.color}">${this.text}</p>
            </div>
        `;

        
        setTimeout(() => {
            this.remove();
        }, 6000);
        
    }
}

window.customElements.define('custom-toast', customToast);