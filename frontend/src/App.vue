<template>
  <div id="app" class="min-h-screen font-main-font text-white overflow-hidden relative">
    <!-- Animated global background wrapper -->
    <div 
      :class="backgroundClass" 
      class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out"
    >
      <!-- Optional dark overlay for better glassmorphism contrast -->
      <div class="absolute inset-0 bg-black/40"></div>
    </div>
    
    <!-- Main content container -->
    <div class="relative z-10 w-full h-screen overflow-y-auto overflow-x-hidden scroll-smooth">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script>
import '@/assets/styles/boutons.css';

export default {
  name: 'App',
  computed: {
    backgroundClass() {
      if (this.$route.path === '/') {
        return 'bg-accueil';
      } else if (this.$route.path === '/selectAgents' || this.$route.path === '/selectMoney') {
        return 'bg-settings';
      } else if (/^\/randomWeapons\/\d+$/.test(this.$route.path)) {
        return 'bg-results';
      } else {
        return 'bg-settings';
      }
    }
  }
};
</script>

<style>
/* Backgrounds handled efficiently */
.bg-accueil {
  background-image: url('@/assets/img/mb-bg-accueil.svg');
}
.bg-settings {
  background-image: url('@/assets/img/mb-bg-settings.svg');
}
.bg-results {
  background-image: url('@/assets/img/mb-bg-results.svg');
}

@media (min-width: 1024px) {
  .bg-accueil { background-image: url('@/assets/img/bg-accueil.svg'); }
  .bg-settings { background-image: url('@/assets/img/bg-settings.svg'); }
  .bg-results { background-image: url('@/assets/img/bg-results.svg'); }
}

/* Page transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* FONTS */
@font-face {
  font-family: 'MainFont';
  src: url('@/assets/fonts/Valorant/VALORANT-Regular.woff') format('woff'),
       url('@/assets/fonts/Valorant/VALORANT-Regular.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'SecondaryFont';
  src: url('@/assets/fonts/Tungsten/Tungsten-Bold.woff') format('woff'),
       url('@/assets/fonts/Tungsten/Tungsten-Bold.woff2') format('woff2');
  font-weight: bold;
  font-style: normal;
}

@font-face {
  font-family: 'ThirdFont';
  src: url('@/assets/fonts/Aileron/Aileron-Black.woff') format('woff'),
       url('@/assets/fonts/Aileron/Aileron-Black.woff2') format('woff2');
  font-weight: bold;
  font-style: normal;
}

#app {
  font-family: 'MainFont', 'SecondaryFont', 'ThirdFont', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Glassmorphism utilities */
.glass-panel {
  background: rgba(17, 17, 17, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.glass-valorant-red {
  background: rgba(255, 70, 85, 0.8);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 150, 150, 0.3);
  box-shadow: 0 4px 15px rgba(255, 70, 85, 0.4);
}
</style>
