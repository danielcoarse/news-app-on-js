"use strict";

// Custom http module
function customHttp() {
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
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", url);

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

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}

// Init http module
const http = customHttp();

const newsService = (function () {
  const apiKey = "f90fdca5d3ea4edebc35843b322e29f0";
  const apiUrl = "https://newsapi.org/v2";

  return {
    topHeadlines(country = "ua", category, cb) {
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

// Elements
const form = document.forms["newsControls"];
const countrySelect = form.elements["country"];
const searchInput = form.elements["search"];
const categorySelect = form.elements["category"];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadNews();
});

// Init selects
document.addEventListener("DOMContentLoaded", function () {
  M.AutoInit();
  loadNews();
});

// Load News function
function loadNews() {
  showLoader();

  const country = countrySelect.value;
  const searchText = searchInput.value;
  const category = categorySelect.value;

  if (!searchText) {
    newsService.topHeadlines(country, category, onGetResponse);
  } else {
    newsService.everithing(searchText, onGetResponse);
  }
}

// Function on get response on server
function onGetResponse(err, res) {
  removePreloader();

  if (err) {
    showAlert(err, "error-msg");
    return;
  }

  if (!res.articles.length) {
    showAlert("Not found", "error-msg");
    return;
  }

  renderNews(res.articles);
}

// Function Render News
function renderNews(news) {
  const newsContainer = document.querySelector(".news-container .row");
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = "";

  news.forEach((newsItem) => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

// Function Clear Container
function clearContainer(cont) {
  // cont.innerHtml = "";
  let child = cont.lastElementChild;
  while (child) {
    cont.removeChild(child);
    child = cont.lastElementChild;
  }
}

// News item template function
function newsTemplate({ title, url, urlToImage, description }) {
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}" style="max-width: 481.5px; min-height: 300px; object-fit: cover;">
          <span class="card-title" style="width: 100%">
            ${title || ""}
          </span>
        </div>
        <div class="card-content" style="max-width: 481.5px; height: auto">
          <p>${description || ""}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `;
}

function showAlert(msg, type = "success") {
  M.toast({ html: msg, classes: type });
}

// Show loader function
function showLoader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
      <div class="progress">
        <div class="indeterminate"></div>
      </div>
    `
  );
}

// Remove loader function
function removePreloader() {
  const loader = document.querySelector(".progress");

  if (loader) {
    loader.remove();
  }
}
