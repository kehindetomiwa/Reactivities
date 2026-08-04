import axios from "axios";
import { store } from "../stores/store";
import { toast } from "react-toastify";
import { router } from "../../app/router/Routes";

const agent = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Identity issues its auth cookie cross-origin (:3000 -> :5001); without this
  // the browser neither stores nor sends it, so login silently has no effect.
  withCredentials: true,
});

agent.interceptors.request.use((config) => {
  store.uiStore.isBusy();
  return config;
});

agent.interceptors.response.use(
  (response) => {
    store.uiStore.isIdle();
    return response;
  },
  async (error) => {
    store.uiStore.isIdle();

    // Network/CORS failures have no response; destructuring it would throw here
    // and mask the original error.
    if (!error.response) {
      toast.error("Network error - is the API running?");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 400:
        if (data.errors){
          const modelStateErrors = [];
          for(const key in data.errors){
            if(data.errors[key]){
              modelStateErrors.push(data.errors[key]);
              
            }
          }
          throw modelStateErrors.flat();
          
        }else{
          toast.error(data);
        }
        
        break;
      case 401:
        toast.error("Unauthorized");
        break;
      case 404:
        router.navigate("/not-found");
        break;

      case 500:
        router.navigate("/server-error", {state: {error: data}})
        break;
      default:
        break;
    }
    return Promise.reject(error);
  },
);

export default agent;
