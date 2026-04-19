import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/styles/style.css';

const app = createApp(App);

app.config.globalProperties.$changeFavicon = (iconUrl) => {
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = iconUrl;
};

// Utilisation du router
app.use(router);

app.mount('#app');
