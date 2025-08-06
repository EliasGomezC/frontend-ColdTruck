import axios from "axios";

const apiLocalHost = axios.create({
    baseURL: "https://backend-coldtruck.onrender.com/api",
});

export default apiLocalHost