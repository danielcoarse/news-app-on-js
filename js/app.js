// Http
function custopHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });
        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });
        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
  };
}
const http = custopHttp();

// Elements
const categoryList = document.querySelector(".category-list");
const articlesContainer = document.querySelector(".card-columns");
const searchIcon = document.getElementById("search-icon");
const loader = document.getElementById("preloder");
const searchBar = document.querySelector(".search-modal");
const serchBarCloser = document.querySelector(".close");
const form = document.forms["newsControls"];

// News service
const newsService = (function () {
  const apiUrl = "http://newsapi.org/v2";
  const apiKey = "f90fdca5d3ea4edebc35843b322e29f0";

  return {
    topHeadlines(country = "us", category = "general", cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
        cb
      );
    },
    everithing(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();

// Listeners
categoryList.addEventListener("click", loadCategoryNews);
searchIcon.addEventListener("click", showSearchBar);
serchBarCloser.addEventListener("click", onCloseBarHandler);
form.addEventListener("submit", onSubmitHandler);

document.addEventListener("DOMContentLoaded", function () {
  loadTopNews();
});



// Main functions
function loadCategoryNews(e) {
  const target = e.target;
  if (target.classList.contains("category-item")) {
    const category = target.getAttribute("value");
    clearContainer(articlesContainer);
    showPreloader();
    newsService.topHeadlines("us", category, onGetResponse);
  }
}

function onSubmitHandler(e) {
  e.preventDefault();
  const searchInput = form.elements["search"];
  const searchText = searchInput.value;
  newsService.everithing(searchText, onGetResponse);
  form.reset();
  onCloseBarHandler();
}

function loadTopNews() {
  showPreloader();
  newsService.topHeadlines("us", "general", onGetResponse);
}

function onGetResponse(err, res) {
  if (err) {
    showAlert(err, "error-msg");
    return;
  }

  if (!res.articles.length) {
    showAlert("Not found", "error-msg");
    return;
  }

  renderNews(res.articles);
  removePreloader();
}

function renderNews(res) {
  const articles = res;

  if (articlesContainer.children.length) {
    clearContainer(articlesContainer);
  }

  let fragment = "";

  articles.forEach((el) => {
    const article = articleTemlate(el);
    fragment += article;
  });

  articlesContainer.insertAdjacentHTML("afterbegin", fragment);
}

function articleTemlate({ title, url, urlToImage, publishedAt, description }) {
  return `
  <article class="card mb-3 border-0">
    <div class="card-header bg-white border-0">
      <a href="${url}" class="card-title">
        <h5>${title}</h5>
      </a>
      <div class="card-meta">
        <small class="text-muted">${publishedAt || ""}</small>
      </div>
    </div>
    <a href="${url}" class="card-img">
      <img
        src="${urlToImage}"
        class="card-img-top rounded-0"
        alt="${title}"
      />
    </a>
    <div class="card-body">
      <p class="card-text">
        ${description || ""}
      </p>
    </div>
  </article>
  `;
}

function clearContainer(cont) {
  let child = cont.lastElementChild;
  while (child) {
    cont.removeChild(child);
    child = cont.lastElementChild;
  }
}

function showPreloader() {
  loader.style.visibility = "visible";
}

function removePreloader() {
  loader.style.visibility = "hidden";
}

function showSearchBar() {
  searchBar.classList.toggle("search-modal-toggle");
}

function onCloseBarHandler() {
  searchBar.classList.remove("search-modal-toggle");
}

function showAlert(msg, type = "success") {
  const alert = alertTemplate(msg);
  document.body.insertAdjacentElement("afterbegin", alert);
  setTimeout(removeAlert, 2000);
}

function removeAlert() {
  const alert = document.querySelector(".alert");
  alert.remove();
}

function alertTemplate(msg) {
  const alert = document.createElement("div");
  alert.classList.add("alert", "alert-warning", "mt-5", "rounded-0");
  alert.setAttribute("role", "alert");
  alert.style.position = "fixed";
  alert.style.top = "60px";
  alert.style.right = "30px";
  alert.style.zIndex = "99";
  alert.textContent = msg;
  return alert;
}