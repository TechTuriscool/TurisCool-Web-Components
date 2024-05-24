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
      this.redirect = "new-al-v2-growersgo"
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
window.location.href = `https://academy.turiscool.com/${redirect}`;
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
    coursesData.totalUnits += course.completed_units;
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

courses.innerHTML = `${this.progressFiltered.totalCourses}`;
progressRate.value = `${this.progressFiltered.completedCourses}`;
average.innerHTML = `${this.progressFiltered.averageTotalCourseProgress}`;
time.innerHTML = `${this.progressFiltered.totalTime}min`;

this.progressFiltered.lastCourse = this.progressFiltered.lastCourse.replace(/-/g, " ");

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

for (let i = 0; i < this.progress.length; i++) {
  if (this.progress[i].progress_rate > 0 && this.progress[i].progress_rate < 100) {
    this.progressFiltered.coursesStarted += 1;
  } else if (this.progress[i].progress_rate === 100) {
    this.progressFiltered.completedCourses += 1;
    totalProgress += this.progress[i].average_score_rate / 10;
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
              <svg viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#FFFFFF"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>profile [#1336]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-380.000000, -2159.000000)" fill="#000000"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M334,2011 C337.785,2011 340.958,2013.214 341.784,2017 L326.216,2017 C327.042,2013.214 330.215,2011 334,2011 M330,2005 C330,2002.794 331.794,2001 334,2001 C336.206,2001 338,2002.794 338,2005 C338,2007.206 336.206,2009 334,2009 C331.794,2009 330,2007.206 330,2005 M337.758,2009.673 C339.124,2008.574 340,2006.89 340,2005 C340,2001.686 337.314,1999 334,1999 C330.686,1999 328,2001.686 328,2005 C328,2006.89 328.876,2008.574 330.242,2009.673 C326.583,2011.048 324,2014.445 324,2019 L344,2019 C344,2014.445 341.417,2011.048 337.758,2009.673" id="profile-[#1336]"> </path> </g> </g> </g> </g></svg><p id="username"></p></div>
              <div class="emailContainer"><svg height="200px" width="200px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#000000;} </style> <g> <path class="st0" d="M510.746,110.361c-2.128-10.754-6.926-20.918-13.926-29.463c-1.422-1.794-2.909-3.39-4.535-5.009 c-12.454-12.52-29.778-19.701-47.531-19.701H67.244c-17.951,0-34.834,7-47.539,19.708c-1.608,1.604-3.099,3.216-4.575,5.067 c-6.97,8.509-11.747,18.659-13.824,29.428C0.438,114.62,0,119.002,0,123.435v265.137c0,9.224,1.874,18.206,5.589,26.745 c3.215,7.583,8.093,14.772,14.112,20.788c1.516,1.509,3.022,2.901,4.63,4.258c12.034,9.966,27.272,15.45,42.913,15.45h377.51 c15.742,0,30.965-5.505,42.967-15.56c1.604-1.298,3.091-2.661,4.578-4.148c5.818-5.812,10.442-12.49,13.766-19.854l0.438-1.05 c3.646-8.377,5.497-17.33,5.497-26.628V123.435C512,119.06,511.578,114.649,510.746,110.361z M34.823,99.104 c0.951-1.392,2.165-2.821,3.714-4.382c7.689-7.685,17.886-11.914,28.706-11.914h377.51c10.915,0,21.115,4.236,28.719,11.929 c1.313,1.327,2.567,2.8,3.661,4.272l2.887,3.88l-201.5,175.616c-6.212,5.446-14.21,8.443-22.523,8.443 c-8.231,0-16.222-2.99-22.508-8.436L32.19,102.939L34.823,99.104z M26.755,390.913c-0.109-0.722-0.134-1.524-0.134-2.341V128.925 l156.37,136.411L28.199,400.297L26.755,390.913z M464.899,423.84c-6.052,3.492-13.022,5.344-20.145,5.344H67.244 c-7.127,0-14.094-1.852-20.142-5.344l-6.328-3.668l159.936-139.379l17.528,15.246c10.514,9.128,23.922,14.16,37.761,14.16 c13.89,0,27.32-5.032,37.827-14.16l17.521-15.253L471.228,420.18L464.899,423.84z M485.372,388.572 c0,0.803-0.015,1.597-0.116,2.304l-1.386,9.472L329.012,265.409l156.36-136.418V388.572z"></path></g></g></svg><p id="email"></p>
              <button onclick="window.open('https://academy.turiscool.com/profile', '_blank')">EDITAR PERFIL</button></div>
              <div class="star">
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
              <div>
                <strong class="textoPosicion2">ÚLTIMO CURSO:</strong>
                  <p id="course-card-last-course">...</p> 
              </div>              
            </div>
            <div class="segundaFila">
              <div class="h3"><svg fill="#000000" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
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
            <strong>Progreso:</strong> 
            <progress id="course-card-progress" value="25" min="0" max="100"></progress>
          </div>
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
    
      <div class="container impar">
    
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
        <h1 class="tituloTuEscuela">TU HOTEL</h1>
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
    
      <button class="btn" onclick="redirectButton()">VOLVER</button>
  `;
  this.functionStart();

};


}

window.customElements.define('custom-leaderboard', customLeaderBoard);