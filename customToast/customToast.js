class customToast extends HTMLElement {
    constructor() {
        super();
        this.text;
        this.color;
    }

    static get observedAttributes() {
        return ["text", "color"];
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
            }
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.classList.add('toastBox');

        this.innerHTML = `
            <div class="toast">
                <p style="color: ${this.color}">${this.text}</p>
            </div>
        `;

        
        setTimeout(() => {
            this.remove();
        }, 6000);
        
    }
}

window.customElements.define('custom-toast', customToast);