import axios from 'axios';

let baseURL = 'http://flow2.pcc.pub:8091'
const publishedProject = {
    projectId: "p_c36f8bsfwb9c",
    publishedProjectId: "abuiplfql48ao_p_c36f8bsfwb9c",
    publishedProjectToken: "ZmU2YmIzNjMtZWFkNi00ZjE2LTliZDctZTljYjhhODA0Mzk2"
}

// 环境的切换
if (process.env['NODE_ENV'] === 'test') {
    baseURL = 'http://flow2.pcc.pub:8091'
} else if (process.env['NODE_ENV'] === 'dev') {
    baseURL = 'http://localhost:8091/'
} else if (process.env['NODE_ENV'] === 'prod') {
    baseURL = 'https://app.promptai.cn'
}
const instance = axios.create({
    timeout: 6 * 1e4,
    baseURL: baseURL,
});

instance.interceptors.request.use(
    (options) => {
        const {headers} = options;
        let contentType = 'application/json;charset=UTF-8';
        if (headers['Content-Type'] || headers['content-type']) {
            contentType = headers['Content-Type'] || headers['content-type'];
        }

        headers['Content-Type'] = contentType;
        headers['x-project-id'] = publishedProject.projectId;
        headers['x-published-project-id'] = publishedProject.publishedProjectId;
        headers['x-published-project-token'] = publishedProject.publishedProjectToken;
        return options;
    },
    (error) => {
        // config error
        return Promise.reject(error);
    }
);
const jsonContentTypes = [
    'application/json;charset=UTF-8',
    'application/json',
    'application/json;',
];
instance.interceptors.response.use(
    (response) => {
        const {status, data, headers} = response;
        if (199 < status && status < 300) {
            const isJson = jsonContentTypes.includes(
                headers['content-type'] || headers['Content-Type']
            );
            if (isJson) {
                return Promise.resolve(data);
            }
            return Promise.resolve(response);
        }
        return Promise.reject(data);
    },
    async (error) => {
        const {
            status,
        } = error.response || {};
        let data = error.response.data;
        if (data instanceof Blob) {
            const text = await data.text();
            try {
                data = JSON.parse(text);
            } catch (e) {
                // no handle
            }
        }
        if (status === 400 || status === 401 || status === 404) {
            return Promise.reject(data);
        }
        return Promise.reject(data);
    }
);
export default instance;

export function get(url, params, config) {
    return instance.get(url, params ? {params, ...config} : config);
}

export function post(url, data, config) {
    return instance.post(url, data, config);
}

export function put(url, data, config) {
    return instance.put(url, data, config);
}

export function del(url, data, config) {
    return instance.delete(url, {
        ...config,
        params: data,
    });
}

export function getBaseUrl() {
    return baseURL;
}