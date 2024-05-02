export class customCard extends HTMLElement {
        constructor() {
        super();
        this.title;
        this.description;
        this.image;
        this.navigation;
        this.progress;
    }
    static get observedAttributes() {
        return ["title", "description", "image", "navigation", "progress"];
    }

    attributeChangedCallback(attribute, oldValue, newValue) {
        if (oldValue !== newValue) {
            switch (attribute) {
                case "title":
                    this.title = newValue;
                    break;
                case "description":
                    this.description = newValue;
                    break;
                case "image":
                    this.image = newValue;
                    break;
                case "navigation":
                    this.navigation = newValue;
                    break;
                case "progress":
                    this.progress = newValue;
                    break;
            }
        }
    }


    connectedCallback() {
        this.innerHTML = `
        <div class = "card">
            <div class = "image-card">
                <img src="${this.image}" alt="${this.title}">
            </div>
            <div class="article-preview typewriter">
                <h2>${this.title}</h2>
                <p>${this.description}</p>
                <div class="skill">
                        <div class="skill-bar">
                            <div class="skill-percentage" per="${this.progress}%" style="max-width:${this.progress}%"></div>
                        </div>
                    </div>
                </div>
                <a href="${this.navigation}"><button>Ir al curso</button></a>
                <div>
            </div>
        </div>`;
    }
}

window.customElements.define('custom-card', customCard);
