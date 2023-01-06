const axios = require("axios");
const { log } = require("wechaty");
const config = require("../../config");

const { baseURL, projectId, publishedProjectId, publishedProjectToken } =
  config;
const publishedProject = {
  projectId,
  publishedProjectId,
  publishedProjectToken,
};

const instance = axios.create({
  timeout: 6 * 1e4,
  baseURL: baseURL,
});

instance.interceptors.request.use(
  (options) => {
    const { headers } = options;
    let contentType = "application/json;charset=UTF-8";
    if (headers["Content-Type"] || headers["content-type"]) {
      contentType = headers["Content-Type"] || headers["content-type"];
    }

    headers["Content-Type"] = contentType;
    headers["x-project-id"] = publishedProject.projectId;
    headers["x-published-project-id"] = publishedProject.publishedProjectId;
    headers["x-published-project-token"] =
      publishedProject.publishedProjectToken;
    return options;
  },
  (error) => {
    // config error
    return Promise.reject(error);
  }
);
const jsonContentTypes = [
  "application/json;charset=UTF-8",
  "application/json",
  "application/json;",
];
instance.interceptors.response.use(
  (response) => {
    const { status, data, headers } = response;
    if (199 < status && status < 300) {
      const isJson = jsonContentTypes.includes(
        headers["content-type"] || headers["Content-Type"]
      );
      if (isJson) {
        return Promise.resolve(data);
      }
      return Promise.resolve(response);
    }
    return Promise.reject(data);
  },
  async (error) => {
    const { status } = error.response || {};
    let data = error.response.data;
    log.info(`${JSON.stringify(data)}`);
    if (status === 400 || status === 401 || status === 404) {
      return Promise.reject(data);
    }
    if (data instanceof Blob) {
      const text = await data.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        // no handle
      }
    }

    return Promise.reject(data);
  }
);
function get(url, params, config) {
  return instance.get(url, params ? { params, ...config } : config);
}

function post(url, data, config) {
  return instance.post(url, data, config);
}

function put(url, data, config) {
  return instance.put(url, data, config);
}

function del(url, data, config) {
  return instance.delete(url, {
    ...config,
    params: data,
  });
}

function getBaseUrl() {
  return baseURL;
}

module.exports = {
  default: instance,
  get,
  post,
  put,
  del,
  getBaseUrl,
};
