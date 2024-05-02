export class customCarousel extends HTMLElement {
    constructor() {
        super();
        this.images = [];
        this.titles = [];
        this.descriptions = [];
        this.navigations = [];
        this.courseID = [];
        this.progress = [];
        this.blocked = false;
        this.newUser = false;
        this.backgroudColor = "white";
        this.borderColor = "#05BFAD"; 

        this.url = "https://academy.turiscool.com/admin/api/"
        this.token = "Bearer 17xa7adwlycG4qrbRatBdCHW41xtl9jNyaBq4d45";
        this.lwId = "62b182eea31d8d9863079f42";
        this.userId = "65d3763f741db932c906da1c";
        this.requestOptions = {
           method: "GET",
           headers: {
              Authorization: this.token,
              "Content-Type": "application/json",
              "Lw-Client": this.lwId,
           },
        };
    }

    static get observedAttributes() {
        return ["data", "backgroudColor", "borderColor"];
    }

    attributeChangedCallback(attribute, oldValue, newValue) {
        if (attribute === "data" && oldValue !== newValue) {
            const data = JSON.parse(newValue);
            this.images = data.images;
            this.titles = data.titles;
            this.descriptions = data.descriptions;
            this.navigations = data.navigations;
            this.backgroudColor = newValue; 
            this.borderColor = newValue;
            this.filterProgressUser();
        }
    }

    filterProgressUser() {
        for (let i = 0; i < this.navigations.length; i++) {
            const url = this.navigations[i];
            const index = url.indexOf('course/');
            const courseId = url.substring(index + 'course/'.length);
            
            this.courseID.push(courseId);
        }
        this.fetchProgress();
    }

    fetchProgress() {
        let fetchPromises = [];
        for (let i = 0; i < this.courseID.length; i++) {
            fetchPromises.push(
                fetch(`${this.url}/v2/users/${this.userId}/courses/${this.courseID[i]}/progress`, this.requestOptions)
                .then(response => response.json())
                .then(progressData => {
                    this.progress.push(progressData.progress_rate);
                    
                })
            );
        }
    
        Promise.all(fetchPromises)
        .then(() => {
            this.isNewUser();
        });
    }

    isNewUser() {
        for (let i = 0; i < this.progress.length; i++) {
            if(this.progress[i] === 0) {
                this.newUser = true;
            } else if (this.progress[i] === 100 & this.newUser === true) {
                this.renderOldUser();
            }
        }
        this.renderNewUser();
    }

    renderNewUser() {
        this.innerHTML = `
        <div class="custom-carousel" style="border-color:${this.borderColor}; background-color:${this.backgroudColor};">
        ${this.titles.map((title, index) => {
                    if (index === 0 || this.progress[index] === 100) {
                        return `
                            <custom-card class="unlocked"
                                title="${title}" 
                                description="${this.descriptions[index]}" 
                                image="${this.images[index]}"
                                navigation="${this.navigations[index]}"
                            >
                            </custom-card>`;
                    } else {
                        return `
                            <custom-card class="locked"
                                title="${title}" 
                                description="${this.descriptions[index]}" 
                                image="${this.images[index]}"
                                navigation="${this.navigations[index]}"
                                progress="${this.progress[index]}"
                            >
                            </custom-card>`;
                    }
                }).join("")}
            </div>`;
    }

    renderOldUser() {
        this.innerHTML = `
            <div class="custom-carousel" style="border-color:${this.borderColor}; background-color:${this.backgroudColor};">
                ${this.titles.map((title, index) => `
                    <custom-card id="unlocked"
                        title="${title}" 
                        description="${this.descriptions[index]}" 
                        image="${this.images[index]}"
                        navigation="${this.navigations[index]}"
                        progress="${this.progress[index]}"
                    >
                    </custom-card>
                `).join("")}
            </div>`;
    }

}

window.customElements.define('custom-carousel', customCarousel);
