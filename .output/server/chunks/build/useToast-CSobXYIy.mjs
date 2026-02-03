import { e as useState } from './server.mjs';

const toasts = useState("app-toasts", () => []);
let id = 0;
const useToast = () => {
  const show = (message, type = "info", duration = 3e3) => {
    const toast = { id: ++id, message, type };
    toasts.value = [...toasts.value, toast];
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== toast.id);
    }, duration);
  };
  const success = (msg) => show(msg, "success");
  const error = (msg) => show(msg, "error", 5e3);
  const info = (msg) => show(msg, "info");
  return { toasts, show, success, error, info };
};

export { useToast as u };
//# sourceMappingURL=useToast-CSobXYIy.mjs.map
