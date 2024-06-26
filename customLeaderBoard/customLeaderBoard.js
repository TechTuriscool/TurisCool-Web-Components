export class customLeaderBoard extends HTMLElement {
  constructor() {
      super();
      this.url = "https://academy.turiscool.com/admin/api/"
      this.token = "Bearer 17xa7adwlycG4qrbRatBdCHW41xtl9jNyaBq4d45";
      this.lwId = "62b182eea31d8d9863079f42";

      this.requestOptions = {
      method: "GET",
      headers: {
          Authorization: this.token,
          "Content-Type": "application/json",
          "Lw-Client": this.lwId,
      },
      };

      this.actualuser = "";
      this.tag = "";
      this.redirect = "";
      this.pages = 0;
      this.user = {};
      this.users = [];
      this.usersByTag = [];
      this.filteredUsers = [];
      this.theLastUser = {};
      this.theRecientUser = {};
      this.progress = [];
      this.progressFiltered = {
      totalCourses: 0,
      totalUnits: 0,
      coursesStarted: 0,
      completedCourses: 0,
      courseProgress: 0,
      averageTotalCourseProgress: 0,
      totalTime: 0,
      lastCourse: 0,
      dateLastCourse: 0,
      lastSection: 0,
      };

      this.courses = [];
      this.longCourse = {
      name: "",
      time: 0,
      };
      this.shortCourse = {
      name: "",
      time: 100000000,
      };
      this.courseAbandoned = {
      name: "",
      count: 0,
      };
      this.coursePopular = {
      name: "",
      count: 0,
      };
      this.lowerCourseAverage = {
      name: "",
      average: 100000,
      };
      this.highestCourseAverage = {
      name: "",
      average: 0,
      };
      this.lastUserConected = {
      name: "",
      time: 0,
      };
      this.userConected = {
      name: "",
      time: 1000000000,
      };
      this.dataLoaded = false;
  }


redirectButton() {
window.location.href = `https://academy.turiscool.com/${this.redirect}`;
}

static get observedAttributes() {
  return ["data"];
}

attributeChangedCallback(attribute, oldValue, newValue) {
  if (attribute === "data" && oldValue !== newValue) {
          const data = JSON.parse(newValue);
          this.actualuser = data.actualuser;
          this.tag = data.tag;
          this.redirect = data.redirect;
          
    this.render();
        }

}

/////////////////////////// INICIO ///////////////////////////

// LLAMADA A LAS FUNCIONES UNA VEZ CARGADA LA PAGINA //
functionStart() {
if (!this.dataLoaded) {
//userId = document.getElementById('el_1712750078537_354').textContent;
this.fetchMetaProgress();

this.fetchUser();
this.dataLoaded = true;

}
}



/////////////////////////// FUNCIONES DE RECOPILACION DE DATOS ///////////////////////////
fetchMetaProgress() {
fetch(`${this.url}/v2/users/${this.actualuser}/progress?items_per_page=200`, this.requestOptions)
  .then(response => response.json())
  .then(metaData => {
    this.pages = metaData.meta.totalPages;
    this.fetchData();
    this.fetchMeta();
  });
}

fetchMeta() {
this.delay(1000).then(() => {
  fetch(`${this.url}/v2/users?items_per_page=200`, this.requestOptions)
    .then(response => response.json())
    .then(metaData => {
      this.pages = metaData.meta.totalPages;
      this.fetchAlumn();
    })
});
}

fetchData() {
let fetchPromises = [];

for (let i = 1; i <= this.pages; i++) {
  fetchPromises.push(
    fetch(`${this.url}/v2/users/${this.actualuser}/progress?page=${i}&items_per_page=200`, this.requestOptions)
      .then(response => response.json())
      .then(progressData => {
        for (let i = 0; i < progressData.data.length; i++) {
          this.progress.push(progressData.data[i]);
        }
      })
  );
}

Promise.all(fetchPromises)
  .then(() => {
    this.filterProgressUser();
  });
}

fetchUser() {
fetch(`${this.url}/v2/users/${this.actualuser}`, this.requestOptions)
    .then(response => response.json())
    .then(userData => {
        this.user = {
            name: userData.username.toUpperCase(),
            email: userData.email,
            role: userData.role,
            createDate: userData.created,
            tags: userData.tags,
            phoneNumber: userData.fields.phone,
            address: userData.fields.address,
            country: userData.fields.country,
            company: userData.fields.company,
            birthday: userData.fields.birthday,
            nps: userData.nps_score,
            lastLogin: userData.last_login
        }
        this.showUserInfo();
    })
}


fetchAlumn() {
let fetchPromises = [];
this.delay(1000).then(() => {
  for (let i = 0; i < this.pages; i++) {
    fetchPromises.push(
      fetch(`${this.url}/v2/users?items_per_page=200&page=${i}`, this.requestOptions)
        .then(response => response.json())
        .then(data => {
          for (let j = 0; j < data.data.length; j++) {
            let userObject = {
              name: data.data[j].username.toUpperCase(),
              tags: data.data[j].tags,
              id: data.data[j].id,
              nps: data.data[j].nps_score,
              lastLogin: data.data[j].last_login,
            };

            this.users.push(userObject);
          }
        })
    );

  }

  Promise.allSettled(fetchPromises)
    .then(() => {
      this.searchUser();
    });
});
}

fetchProgress() {
let fetchPromises = [];
this.delay(1000).then(() => {
  for (let i = 0; i < this.usersByTag.length; i++) {
    fetchPromises.push(
      fetch(`${this.url}/v2/users/${this.usersByTag[i].id}/progress`, this.requestOptions)
        .then(response => response.json())
        .then(progressData => {
          const isDuplicate = this.filteredUsers.some(user => user.userID === this.usersByTag[i].id);
          if (!isDuplicate) {
            progressData.name = this.usersByTag[i].name;
            progressData.userID = this.usersByTag[i].id;
            progressData.nps = this.usersByTag[i].nps;
            progressData.lastLogin = this.usersByTag[i].lastLogin;
            this.filteredUsers.push(progressData);
          }
        })
    );
  }

  Promise.allSettled(fetchPromises)
    .then(() => {
      this.filterProgress();
    });
});
}


/////////////////////////// FUNCIONES DE FILTRADO DE DATOS ///////////////////////////
searchUser() {
this.users.filter(user => {
  if (user.tags.includes(this.tag)) {
    this.usersByTag.push(user);
  }
});
this.fetchProgress();
}

showTop10() {
let topUsers = [];
for (let i = 0; i < this.filteredUsers.length; i++) {
  let totalScore = 0;
  for (let j = 0; j < this.filteredUsers[i].data.length; j++) {
    totalScore += this.filteredUsers[i].data[j].average_score_rate;
  }
  let averageScore = totalScore / this.filteredUsers[i].data.length;
  averageScore = Math.trunc(averageScore * 10);
  topUsers.push({ name: this.filteredUsers[i].name, total: averageScore })
}
topUsers.sort((a, b) => b.total - a.total);
return topUsers;
}

filterProgress() {
for (let i = 0; i < this.filteredUsers.length; i++) {
  if (this.filteredUsers[i].userID === this.user.id) {
    this.user = this.filteredUsers[i];
  }
}
this.showTopUsers();
this.showTopUsers3();
this.showUserMe();
this.showCourseInfo()
this.filterCourses();
this.showInfoUser();
}

courseInfo() {
let coursesData = {
  totalCoursesCompleted: 0,
  totalTime: 0,
  averageScore: 0,
  totalNPS: 0,
  totalUnits: 0,
  countCurses: 0,
};

let coursesTotal = 0;
for (let i = 0; i < this.filteredUsers.length; i++) {
  coursesData.totalNPS += this.filteredUsers[i].nps;
  coursesTotal += this.filteredUsers[i].data.length;

  this.filteredUsers[i].data.forEach(course => {
    let lessonComplete = true;

    if (course.progress_rate === 100) {
      coursesData.totalCoursesCompleted += 1;
    }
    coursesData.totalTime += course.time_on_course;
    if (course.progress_rate === 100) {
      coursesData.averageScore += course.average_score_rate / 10;
      coursesData.countCurses += 1;
    }

    for (let j = 0; j < course.progress_per_section_unit.length; j++) {
      for (let k = 0; k < course.progress_per_section_unit[j].units.length; k++) {
        if (course.progress_per_section_unit[j].units[k].unit_status === 'completed') {
          coursesData.totalUnits += course.completed_units;
        }
      }
    }
  });
}

coursesData.averageScore = coursesData.averageScore / coursesTotal;
coursesData.averageScore = Math.round((coursesData.averageScore / coursesData.countCurses) * 100);
coursesData.totalNPS = coursesData.totalNPS / this.filteredUsers.length;
return coursesData;
}

filterCourses() {
let totalScores = 0;
let totalCourses = 0;
let arrayCoursesAbandoned = [];
let arrayCoursesPopular = [];

for (let i = 0; i < this.filteredUsers.length; i++) {
  if (this.filteredUsers[i].lastLogin > this.lastUserConected.time) {
    this.lastUserConected.name = this.filteredUsers[i].name;
    this.lastUserConected.time = this.filteredUsers[i].lastLogin;
  }
  if (this.filteredUsers[i].lastLogin === 0 || this.filteredUsers[i].lastLogin === null) {
  } else {
    if (this.filteredUsers[i].lastLogin < this.userConected.time) {
      this.userConected.name = this.filteredUsers[i].name;
      this.userConected.time = this.filteredUsers[i].lastLogin;
    }
  }

  for (let j = 0; j < this.filteredUsers[i].data.length; j++) {
    let course = this.filteredUsers[i].data[j];
    let courseExists = false;
    for (let k = 0; k < this.courses.length; k++) {
      if (this.courses[k].name === course.course_id) {
        courseExists = true;
        this.courses[k].time += course.time_on_course;
        this.courses[k].progress_rate += course.progress_rate;
        this.courses[k].average += course.average_score_rate;
        this.courses[k].count += 1;
        break;
      }
    }

    if (!courseExists) {
      this.courses.push({
        name: course.course_id,
        time: course.time_on_course,
        progress_rate: course.progress_rate,
        average: course.average_score_rate,
        count: 1,
      });
      if (course.progress_rate === 0) {
        arrayCoursesAbandoned.push({
          name: course.course_id,
          count: 1,
        });
      } else if (course.progress_rate > 0) {
        arrayCoursesPopular.push({
          name: course.course_id,
          count: 1,
        });
      }
    }
  }
}


for (let i = 0; i < this.courses.length; i++) {
  if (this.courses[i].time > this.longCourse.time) {
    this.longCourse.name = this.courses[i].name;
    this.longCourse.time = this.courses[i].time;
  }

  if (this.courses[i].time < this.shortCourse.time) {
    this.shortCourse.name = this.courses[i].name;
    this.shortCourse.time = this.courses[i].time;
  }

  if (this.courses[i].average / this.courses[i].count < this.lowerCourseAverage.average) {
    this.lowerCourseAverage.name = this.courses[i].name;
    this.lowerCourseAverage.average = this.courses[i].average / this.courses[i].count;
  }

  if (this.courses[i].average / this.courses[i].count > this.highestCourseAverage.average) {
    this.highestCourseAverage.name = this.courses[i].name;
    this.highestCourseAverage.average = this.courses[i].average / this.courses[i].count;
  }
}

for (let i = 0; i < arrayCoursesAbandoned.length; i++) {
  if (arrayCoursesAbandoned[i].count > this.courseAbandoned.count) {
    this.courseAbandoned.name = arrayCoursesAbandoned[i].name;
    this.courseAbandoned.count = arrayCoursesAbandoned[i].count;
  }
}

for (let i = 0; i < arrayCoursesPopular.length; i++) {
  if (this.arrayCoursesPopular[i].count > this.coursePopular.count) {
    this.coursePopular.name = arrayCoursesPopular[i].name;
    this.coursePopular.count = arrayCoursesPopular[i].count;
  }
}

}

showDate(time) {
const date = new Date(time * 1000);
const day = date.getDate();
const month = date.getMonth() + 1;
const year = date.getFullYear();
const minutes = date.getMinutes();
const hours = date.getHours();

let monthName = "";
let monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

for (let i = 0; i < monthNames.length; i++) {
  if (month === i + 1) {
    monthName = monthNames[i];
  }
}
let finalDate = "";
if (hours > 12) {
  finalDate = `${day} de ${monthName} de ${year}, ${hours}:${minutes} PM`;
} else {
  finalDate = `${day} de ${monthName} de ${year}, ${hours}:${minutes} AM`;
}
return finalDate;
}

/////////////////////////// FUNCIONES DE VISUALIZACION DE DATOS ///////////////////////////

showUserInfo() {
let username = document.getElementById('username');
let email = document.getElementById('email');

function capitalizeInitials(name) {
  if (!name) return ''; 
  return name.split(' ')
             .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
             .join(' ');
}

function showUndefined(name) {
  return name ? capitalizeInitials(name) : 'undefined';
}

username.innerHTML = `${showUndefined(this.user.name)}`;
email.innerHTML = `${this.showUndefined(this.user.email)}`;

}

showProgressInfo() {
let courses = document.getElementById('course-card-courses');
let progressRate = document.getElementById('course-card-progress');
let average = document.getElementById('course-card-average');
let time = document.getElementById('course-card-time');
let lastCourse = document.getElementById('course-card-last-course');
let endCourse = document.getElementById('course-card-end-courses');
let totalUnits = document.getElementById('course-card-units');

courses.innerHTML = `${this.progressFiltered.totalCourses}`;
progressRate.value = `${this.progressFiltered.completedCourses}`;

// Si el tiempo supera los 60 minutos, se convierte en horas
if (this.progressFiltered.totalTime > 60) {
  time.innerHTML = `${Math.round(this.progressFiltered.totalTime / 60)}h`;
} else {
  time.innerHTML = `${this.progressFiltered.totalTime}min`;
}
average.innerHTML = `${this.progressFiltered.averageTotalCourseProgress}`;

this.progressFiltered.lastCourse = this.progressFiltered.lastCourse.replace(/-/g, " ");

totalUnits.innerHTML = this.progressFiltered.totalUnits;
lastCourse.innerHTML = `${this.progressFiltered.lastCourse} (${this.showDate(this.progressFiltered.dateLastCourse)})`;
endCourse.innerHTML = `${this.progressFiltered.completedCourses}`;
}

async showTopUsers() {
let datosRecibidos = false;
let topUsers = await this.showTop10();
let spinner = document.querySelector(".loader");

if (topUsers.length >= 10) {
  for (let i = 0; i < 10; i++) {
    datosRecibidos = true;
    if (datosRecibidos) {
      spinner.style.display = 'none';
    }
    let nombre = document.getElementById(`nombre${i + 1}`);
    let scoreUser = document.getElementById(`scoreUser${i + 1}`);
    let fila = document.getElementById(`fila${i + 1}`);

    if (!topUsers[i].name || !topUsers[i].total || topUsers[i].name === "undefined" || topUsers[i].total === "undefined"  ) {
      break;
    } else {
      fila.style.removeProperty('display');
      nombre.innerHTML = `${topUsers[i].name}`;
      scoreUser.innerHTML = `${topUsers[i].total}`;
    }
  }
}
}

async showTopUsers3() {
let topUsers = await this.showTop10();

for (let i = 0; i < 3; i++) {
  let position = document.getElementById(`position${i + 1}`);
  position.innerHTML = `${i + 1}º - ${topUsers[i].name}`;

}
}

async showUserMe() {
let datosRecibidos = false;
let actualPosition = document.getElementById("actualPosition");
let position = await this.showTop10();

for (let i = 0; i < position.length; i++) {
  if (position[i].name === this.user.name) {
    datosRecibidos = true;
    actualPosition.innerHTML = `${i + 1}`;
    if (datosRecibidos) {
      actualPosition.classList.remove('loading');
    }
  }
}
}

async showCourseInfo() {
let datosRecibidos = false;
let coursesData = await this.courseInfo();
if (coursesData) {
  datosRecibidos = true;
}
let courses = document.getElementById("statistic-courses");
courses.innerHTML = `${coursesData.totalCoursesCompleted} cursos`;

let time = document.getElementById("statistic-hours");
coursesData.totalTime = Math.round(coursesData.totalTime / 60);
time.innerHTML = `${coursesData.totalTime} horas`;

let lessons = document.getElementById("statistic-units");
lessons.innerHTML = `${coursesData.totalUnits} lecciones`;

if (datosRecibidos) {
  courses.classList.remove('loading');
  time.classList.remove('loading');
  lessons.classList.remove('loading');
}
}

async showInfoUser() {
let datosRecibidos = false;
datosRecibidos = true;
let userName = document.getElementById('user-info-name');
let userDate = document.getElementById('user-info-date');

userName.innerHTML = `${this.lastUserConected.name}`;
userDate.innerHTML = `${this.showDate(this.lastUserConected.time)}`;

if (datosRecibidos) {
  userName.classList.remove('loading');
  userDate.classList.remove('loading');
}
}

async filterProgressUser() {
this.progressFiltered.totalCourses = this.progress.length;
let totalProgress = 0;
let totalTime = 0;

console.log(this.progress)

for (let i = 0; i < this.progress.length; i++) {
  if (this.progress[i].progress_rate > 0 && this.progress[i].progress_rate < 100) {
    this.progressFiltered.coursesStarted += 1;
  } else if (this.progress[i].progress_rate === 100) {
    this.progressFiltered.completedCourses += 1;
    totalProgress += this.progress[i].average_score_rate / 10;
  }

  // Calcular lecciones totales 
  for (let j = 0; j < this.progress[i].progress_per_section_unit.length; j++) {
    for (let k = 0; k < this.progress[i].progress_per_section_unit[j].units.length; k++) {
      if (this.progress[i].progress_per_section_unit[j].units[k].unit_status === 'completed') {
        this.progressFiltered.totalUnits += 1;
      }
    }
  }

  totalTime += this.progress[i].time_on_course;

  if (this.progressFiltered.dateLastCourse < this.progress[i].completed_at) {
    this.progressFiltered.dateLastCourse = this.progress[i].completed_at;
    this.progressFiltered.lastCourse = this.progress[i].course_id;
    this.progressFiltered.lastSection = this.progress[i].progress_per_section_unit[0].section_id;
  }
}

this.progressFiltered.courseProgress = this.progressFiltered.completedCourses / this.progressFiltered.totalCourses * 100;
this.progressFiltered.courseProgress = Math.round(this.progressFiltered.courseProgress);

this.progressFiltered.averageTotalCourseProgress = totalProgress / this.progressFiltered.completedCourses;
this.progressFiltered.averageTotalCourseProgress = Math.round(this.progressFiltered.averageTotalCourseProgress);

this.progressFiltered.totalTime = totalTime;

this.showProgressInfo();
}

showUndefined(text) {
if (text === undefined) {
  return "No disponible";
} else {
  return text;
}
}

async delay(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}

render() {

  this.innerHTML = /*html*/`    
      <div class="container impar">
        <div class="container-content">
        
          <div class="profile-card">
            <h2>Perfil:</h2>
            <div class='primeraFila'>
              <div>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 21C4 17.4735 6.60771 14.5561 10 14.0709M16.4976 16.2119C15.7978 15.4328 14.6309 15.2232 13.7541 15.9367C12.8774 16.6501 12.7539 17.843 13.4425 18.6868C13.8312 19.1632 14.7548 19.9983 15.4854 20.6353C15.8319 20.9374 16.0051 21.0885 16.2147 21.1503C16.3934 21.203 16.6018 21.203 16.7805 21.1503C16.9901 21.0885 17.1633 20.9374 17.5098 20.6353C18.2404 19.9983 19.164 19.1632 19.5527 18.6868C20.2413 17.843 20.1329 16.6426 19.2411 15.9367C18.3492 15.2307 17.1974 15.4328 16.4976 16.2119ZM15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg><p id="username"></p><button onclick="window.open('https://academy.turiscool.com/profile', '_blank')">EDITAR PERFIL</button></div>
              <div class="star">
              <div class="moreInfo"><svg data-message="Aquí se muestra tu posición actual en el ranking en comparación con tus compañeros. Completa más cursos para obtener una mayor puntuación y así subir de posición en el ranking. ¡Ánimo!" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="7.25" r="1.25" fill="#000000"></circle> <rect x="11" y="10" width="2" height="8" fill="#000000"></rect> </g></svg></div>
                <strong class="textoPosicion">TU RANKING</strong>
                <svg  viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M923.2 429.6H608l-97.6-304-97.6 304H97.6l256 185.6L256 917.6l256-187.2 256 187.2-100.8-302.4z"
                      fill="#FAD97F"></path>
                    <path
                      d="M1024 396H633.6L512 21.6 390.4 396H0l315.2 230.4-121.6 374.4L512 770.4l316.8 232L707.2 628 1024 396zM512 730.4l-256 187.2 97.6-302.4-256-185.6h315.2l97.6-304 97.6 304h315.2l-256 185.6L768 917.6l-256-187.2z"
                      fill=""></path>
                  </g>
                  <p id="actualPosition"></p>
                </svg>
              </div>
              <div><svg fill="#000000" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M1750.21 0v1468.235h-225.882v338.824h169.412V1920H451.387c-82.447 0-161.506-36.141-214.701-99.388-43.934-51.953-67.652-116.33-67.652-182.965V282.353C169.034 126.494 295.528 0 451.387 0H1750.21Zm-338.823 1468.235H463.81c-89.223 0-166.136 59.86-179.576 140.047-1.242 9.036-2.259 18.07-2.259 27.106v2.26c0 40.658 13.553 77.928 40.659 109.552 32.753 38.4 79.059 59.859 128.753 59.859h960v-112.941H409.599v-112.942h1001.788v-112.94Zm225.882-1355.294H451.387c-92.725 0-169.412 75.67-169.412 169.412v1132.8c50.824-37.27 113.958-59.859 181.835-59.859h1173.46V112.941ZM1354.882 903.53v112.942H564.294V903.529h790.588Zm56.47-564.705v451.764H507.825V338.824h903.529Zm-112.94 112.94H620.765v225.883h677.647V451.765Z"
                  fill-rule="evenodd"></path>
              </g>
              </svg> 
              <p id="course-card-courses"></p>
              <strong>CURSOS TOTALES</strong>
            </div>
              <div>
                <strong class="textoPosicion2">ÚLTIMO CURSO:</strong>
                  <p id="course-card-last-course">...</p> 
              </div>              
            </div>
            <div class="segundaFila">
              <div class="h3">
              <svg fill="#000000" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M493.271,18.748C481.188,6.656,465.112,0,448.019,0s-33.169,6.656-45.252,18.748l-17.886,17.886 c-13.474-6.767-43.221-12.416-86.716,31.113l-102.4,102.4c-5.001,5.001-5.001,13.099,0,18.099c2.5,2.5,5.777,3.746,9.054,3.746 c3.277,0,6.554-1.246,9.054-3.746l102.4-102.4c21.367-21.385,37.419-27.776,47.65-28.254L44.358,377.148 c-21.854,21.854-24.559,55.714-8.132,80.546L3.765,490.155c-5,5.001-5,13.099,0,18.099c2.5,2.5,5.777,3.746,9.054,3.746 s6.554-1.246,9.054-3.746l32.461-32.461C64.71,482.68,76.87,486.4,89.619,486.4c17.092,0,33.169-6.656,45.252-18.748l358.4-358.4 C518.223,84.301,518.223,43.699,493.271,18.748z M116.772,449.553c-7.501,7.501-17.331,11.247-27.153,11.247 c-9.83,0-19.652-3.746-27.153-11.247c-14.993-14.993-14.993-39.313,0-54.306l4.062-4.062c0.427,0.623,0.691,1.323,1.237,1.869 l51.2,51.2c0.555,0.546,1.246,0.811,1.869,1.237L116.772,449.553z M138.31,428.015c-0.427-0.623-0.691-1.323-1.237-1.869 l-51.2-51.2c-0.555-0.546-1.246-0.811-1.869-1.237l212.932-212.932c0.418,0.623,0.683,1.323,1.229,1.877l51.2,51.2 c0.555,0.546,1.246,0.811,1.869,1.237L138.31,428.015z M475.172,91.153L368.71,197.615c-0.427-0.623-0.691-1.323-1.237-1.869 l-51.2-51.2c-0.555-0.546-1.246-0.811-1.869-1.237L420.866,36.847c7.492-7.501,17.323-11.247,27.153-11.247 s19.652,3.746,27.153,11.247C490.165,51.84,490.165,76.16,475.172,91.153z"></path> </g> </g> </g></svg>
                <p id="course-card-units"></p>
                <strong>LECCIONES COMPLETADAS</strong>
              </div>
              <div class="h3"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <g id="style=stroke">
                      <g id="check-box">
                        <path id="vector (Stroke)" fill-rule="evenodd" clip-rule="evenodd"
                          d="M16.5303 8.96967C16.8232 9.26256 16.8232 9.73744 16.5303 10.0303L11.9041 14.6566C11.2207 15.34 10.1126 15.34 9.42923 14.6566L7.46967 12.697C7.17678 12.4041 7.17678 11.9292 7.46967 11.6363C7.76256 11.3434 8.23744 11.3434 8.53033 11.6363L10.4899 13.5959C10.5875 13.6935 10.7458 13.6935 10.8434 13.5959L15.4697 8.96967C15.7626 8.67678 16.2374 8.67678 16.5303 8.96967Z"
                          fill="#000000"></path>
                        <path id="vector (Stroke)_2" fill-rule="evenodd" clip-rule="evenodd"
                          d="M1.25 8C1.25 4.27208 4.27208 1.25 8 1.25H16C19.7279 1.25 22.75 4.27208 22.75 8V16C22.75 19.7279 19.7279 22.75 16 22.75H8C4.27208 22.75 1.25 19.7279 1.25 16V8ZM8 2.75C5.10051 2.75 2.75 5.10051 2.75 8V16C2.75 18.8995 5.10051 21.25 8 21.25H16C18.8995 21.25 21.25 18.8995 21.25 16V8C21.25 5.10051 18.8995 2.75 16 2.75H8Z"
                          fill="#000000"></path>
                      </g>
                    </g>
                  </g>
                </svg> 
              <p id="course-card-end-courses"></p>
              <strong>CURSOS FINALIZADOS</strong> 
              </div>
              <div class="h3"><svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M22,7H16.333V4a1,1,0,0,0-1-1H8.667a1,1,0,0,0-1,1v7H2a1,1,0,0,0-1,1v8a1,1,0,0,0,1,1H22a1,1,0,0,0,1-1V8A1,1,0,0,0,22,7ZM7.667,19H3V13H7.667Zm6.666,0H9.667V5h4.666ZM21,19H16.333V9H21Z">
                    </path>
                  </g>
                </svg> 
              <p id="course-card-average"></p>
              <strong>NOTA MEDIA</strong> 
              </div>
              <div class="h3"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM3.00683 12C3.00683 16.9668 7.03321 20.9932 12 20.9932C16.9668 20.9932 20.9932 16.9668 20.9932 12C20.9932 7.03321 16.9668 3.00683 12 3.00683C7.03321 3.00683 3.00683 7.03321 3.00683 12Z"
                      fill="#0F0F0F"></path>
                    <path
                      d="M12 5C11.4477 5 11 5.44771 11 6V12.4667C11 12.4667 11 12.7274 11.1267 12.9235C11.2115 13.0898 11.3437 13.2343 11.5174 13.3346L16.1372 16.0019C16.6155 16.278 17.2271 16.1141 17.5032 15.6358C17.7793 15.1575 17.6155 14.5459 17.1372 14.2698L13 11.8812V6C13 5.44772 12.5523 5 12 5Z"
                      fill="#0F0F0F"></path>
                  </g>
                </svg> 
              <p id="course-card-time"></p>
              <strong>TIEMPO ESTUDIADO</strong> 
            </div>
            </div>
            <div class="h3 terceraFila" >
            <div class="moreInfo"><svg  data-message="Aquí se muestra tu progreso total en los cursos completados en comparación con el total de cursos disponibles." viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="7.25" r="1.25" fill="#000000"></circle> <rect x="11" y="10" width="2" height="8" fill="#000000"></rect> </g></svg></div>
            <strong>Progreso total de tus cursos:</strong> 
            <progress id="course-card-progress" value="25" min="0" max="100"></progress>
          </div>
      </div>
      </div>

      </div>
      <div class="container impar">
      <div class="moreInfo"><svg data-message="Completa más cursos para obtener una mayor puntuación y así subir de posición en el ranking. ¡Ánimo!" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="7.25" r="1.25" fill="#000000"></circle> <rect x="11" y="10" width="2" height="8" fill="#000000"></rect> </g></svg></div>

        <h1 class="tituloTuEscuela">Ranking</h1>
        <div class="container-content">
    
          <div class="table-section">
            <h3>Ranking alumnos</h3>
            <table>
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Nombre</th>
                  <th>Puntuación</th>
                </tr>
              </thead>
                <tbody id="top10Users">
                  <tr id='fila1' style='display: none'><td>1</td><td id='nombre1'>undefined</td><td id='scoreUser1'>0</td></tr>
                  <tr id='fila2' style='display: none'><td>2</td><td id='nombre2'>undefined</td><td id='scoreUser2'>0</td></tr>
                  <tr id='fila3' style='display: none'><td>3</td><td id='nombre3'>undefined</td><td id='scoreUser3'>0</td></tr>
                  <tr id='fila4' style='display: none'><td>4</td><td id='nombre4'>undefined</td><td id='scoreUser4'>0</td></tr>
                  <tr id='fila5' style='display: none'><td>5</td><td id='nombre5'>undefined</td><td id='scoreUser5'>0</td></tr>
                  <tr id='fila6' style='display: none'><td>6</td><td id='nombre6'>undefined</td><td id='scoreUser6'>0</td></tr>
                  <tr id='fila7' style='display: none'><td>7</td><td id='nombre7'>undefined</td><td id='scoreUser7'>0</td></tr>
                  <tr id='fila8' style='display: none'><td>8</td><td id='nombre8'>undefined</td><td id='scoreUser8'>0</td></tr>
                  <tr id='fila9' style='display: none'><td>9</td><td id='nombre9'>undefined</td><td id='scoreUser9'>0</td></tr>
                  <tr id='fila10' style='display: none'><td>10</td><td id='nombre10'>undefined</td><td id='scoreUser10'>0</td></tr>
              </tbody>
            </table>
            <div class="loader"></div>
          </div>
          <div>
            <div>
              <div class="podio">
                <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" style="enable-background:new 0 0 1024 1024"
                  xml:space="preserve" fill="#000000">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M918.4 201.6c-6.4-6.4-12.8-9.6-22.4-9.6H768V96c0-9.6-3.2-16-9.6-22.4C752 67.2 745.6 64 736 64H288c-9.6 0-16 3.2-22.4 9.6C259.2 80 256 86.4 256 96v96H128c-9.6 0-16 3.2-22.4 9.6-6.4 6.4-9.6 16-9.6 22.4 3.2 108.8 25.6 185.6 64 224 34.4 34.4 77.56 55.65 127.65 61.99 10.91 20.44 24.78 39.25 41.95 56.41 40.86 40.86 91 65.47 150.4 71.9V768h-96c-9.6 0-16 3.2-22.4 9.6-6.4 6.4-9.6 12.8-9.6 22.4s3.2 16 9.6 22.4c6.4 6.4 12.8 9.6 22.4 9.6h256c9.6 0 16-3.2 22.4-9.6 6.4-6.4 9.6-12.8 9.6-22.4s-3.2-16-9.6-22.4c-6.4-6.4-12.8-9.6-22.4-9.6h-96V637.26c59.4-7.71 109.54-30.01 150.4-70.86 17.2-17.2 31.51-36.06 42.81-56.55 48.93-6.51 90.02-27.7 126.79-61.85 38.4-38.4 60.8-112 64-224 0-6.4-3.2-16-9.6-22.4zM256 438.4c-19.2-6.4-35.2-19.2-51.2-35.2-22.4-22.4-35.2-70.4-41.6-147.2H256v182.4zm390.4 80C608 553.6 566.4 576 512 576s-99.2-19.2-134.4-57.6C342.4 480 320 438.4 320 384V128h384v256c0 54.4-19.2 99.2-57.6 134.4zm172.8-115.2c-16 16-32 25.6-51.2 35.2V256h92.8c-6.4 76.8-19.2 124.8-41.6 147.2zM768 896H256c-9.6 0-16 3.2-22.4 9.6-6.4 6.4-9.6 12.8-9.6 22.4s3.2 16 9.6 22.4c6.4 6.4 12.8 9.6 22.4 9.6h512c9.6 0 16-3.2 22.4-9.6 6.4-6.4 9.6-12.8 9.6-22.4s-3.2-16-9.6-22.4c-6.4-6.4-12.8-9.6-22.4-9.6z"
                      fill="#000000"></path>
                  </g>
                </svg>
                <div class="ganador" style="display: flex; justify-content: center; align-items: center;">
                  <h1 id="position1"></h1><img class="spinerVisible" style="height: 20px;" src="spiner.gif" alt="">
                </div>
                <div class="segundo" style="display: flex; justify-content: center; align-items: center;">
                  <h1 id="position2"></h1><img class="spinerVisible" style="height: 20px;" src="spiner.gif" alt="">
                </div>
                <div class="tercero" style="display: flex; justify-content: center; align-items: center;">
                  <h1 id="position3"></h1><img class="spinerVisible" style="height: 20px;" src="spiner.gif" alt="">
                </div>
              </div>
            </div>
          </div>
        </div>
    
      </div>
    
    
      <div class="container par statistics">
        <h1 class="tituloTuEscuela">Métricas de tu Empresa</h1>
        <div class="container-content2">
          <div class="statistic">
    
            <h2>Horas estudiadas</h2>
            <p id="statistic-hours" class="loading">Cargando</p>
          </div>
          <div class="statistic">
            <h2>Cursos realizados</h2>
            <p id="statistic-courses" class="loading">Cargando</p>
          </div>
          <div class="statistic" class="loading">
            <h2>Lecciones completadas</h2>
            <p id="statistic-units" class="loading">Cargando</p>
          </div>
        </div>
      </div>

      <div class="container par">
      <div class="container-content">
        <div class="user-info">
          <h4>Último usuario conectado</h4>
          <h2 id="user-info-name" class="loading">Cargando</h2>
        </div>
        <div class="user-info">
          <h4>Última conexion</h4>
          <h2 id="user-info-date" class="loading">Cargando</h2>
        </div>
      </div>
    </div>
  </div>
    
      <button id="btn-redirect" class="btn" urlRedirect='${this.redirect}'>VOLVER</button>

      <div id="myModal" class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <p id="modal-message">Aquí puedes poner tu mensaje personalizado</p>
        </div>
      </div>

  `;
  this.functionStart();

};


}

// DOCUMENT ADDEVENTLISTENER
document.addEventListener('DOMContentLoaded', (event) => {
  const modal = document.getElementById('myModal');
  const span = document.getElementsByClassName('close')[0];
  const modalMessage = document.getElementById('modal-message');
  const btnRedirect = document.getElementById('btn-redirect');

  btnRedirect.addEventListener('click', function () {
      const redirect = this.getAttribute('urlRedirect');
      window.location.href = 'https://academy.turiscool.com/' + redirect;
  });
  
  document.querySelectorAll('svg[data-message]').forEach(svg => {
    svg.addEventListener('click', function () {
      const message = this.getAttribute('data-message');
      if (message) {
        modalMessage.textContent = message;
        modal.style.display = 'block';
      }
    });
  });

  span.onclick = function() {
    modal.style.display = 'none';
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
});


window.customElements.define('custom-leaderboard', customLeaderBoard);