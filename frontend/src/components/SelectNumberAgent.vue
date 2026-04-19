<template>
  <div class="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center relative text-white">

    <!-- Back Home Button -->
    <div class="absolute top-8 left-8 z-50">
      <router-link to="/" class="group flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div class="w-10 h-10 rounded-full glass-panel flex items-center justify-center border border-white/20 group-hover:border-[#ff4655] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white group-hover:text-[#ff4655] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </div>
      </router-link>
    </div>

    <!-- Title -->
    <h1 class="text-6xl md:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 font-secondary-font mb-4 pt-16 md:pt-24 tracking-wider uppercase text-center drop-shadow-lg">
      AGENTS
    </h1>

    <div class="w-full max-w-6xl flex flex-col items-center mt-8">
      
      <!-- Loading State -->
      <div v-if="loading" class="text-xl font-third-font animate-pulse text-[#ff4655]">
        Loading agents...
      </div>

      <!-- Section Number of players -->
      <transition name="fade" mode="out-in">
        <div v-if="result.length === 0 && !loading" class="glass-panel rounded-3xl p-8 md:p-12 flex flex-col gap-8 items-center mt-12 w-full max-w-md">
          <div class="text-2xl text-[#ece8e1] font-third-font font-bold uppercase tracking-widest text-center">Number of players</div>

          <!-- Sélecteur de nombre d'agents -->
          <div class="flex items-center gap-6 bg-black/40 rounded-full p-2 border border-white/10">
            <button
                class="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 hover:bg-[#ff4655] text-white text-3xl font-bold transition-all duration-300"
                @click="decrement"
            >−</button>
            <div class="w-16 text-center text-white text-3xl font-third-font font-bold">
              {{ numberAgent }}
            </div>
            <button
                class="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 hover:bg-[#ff4655] text-white text-3xl font-bold transition-all duration-300"
                @click="increment"
            >+</button>
          </div>

          <!-- Bouton RANDOMIZE -->
          <button 
            @click="randomizeAgent" 
            class="relative group overflow-hidden rounded-lg font-third-font font-bold text-xl h-16 w-full bg-[#ff4655] text-white mt-4 hover:shadow-[0_0_20px_rgba(255,70,85,0.6)] transition-all duration-300"
          >
            <div class="absolute inset-0 w-full h-full bg-black/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            <span class="relative z-10 flex items-center justify-center h-full tracking-widest">
              RANDOMIZE
            </span>
          </button>
        </div>
      </transition>

      <!-- Liste des agents -->
      <transition name="fade">
        <div v-if="result.length > 0" class="w-full mt-8">
          <ul class="flex flex-wrap justify-center gap-6 md:gap-8">
            <li 
              v-for="(agent, index) in result" 
              :key="agent.uuid" 
              class="relative flex flex-col items-center glass-panel rounded-2xl p-6 group w-64 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,70,85,0.2)] hover:-translate-y-2 overflow-hidden"
            >
              <!-- Background accent -->
              <div class="absolute -top-20 -right-20 w-40 h-40 bg-[#ff4655]/20 rounded-full blur-3xl group-hover:bg-[#ff4655]/40 transition-colors duration-500"></div>
              
              <h3 class="font-secondary-font tracking-widest text-[#ece8e1]/70 text-3xl z-10">Player {{ index + 1 }}</h3>
              
              <div class="relative w-full h-48 my-4 flex justify-center items-center z-10">
                <img :src="agent.icon" :alt="`Image de ${agent.displayName}`" class="h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500" />
              </div>
              
              <p class="text-white font-third-font text-2xl uppercase z-10 font-bold tracking-wider">{{ agent.name }}</p>

              <!-- Bouton Try Again centré au survol -->
              <div class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                <button
                    @click="randomizeSingleAgent(index)"
                    class="bg-[#ff4655] hover:bg-white hover:text-[#ff4655] text-white font-third-font font-bold px-6 py-3 rounded-lg tracking-widest transition-colors duration-300 shadow-lg"
                >
                  TRY AGAIN
                </button>
              </div>
            </li>
          </ul>

          <!-- Bouton RANDOMIZE WEAPONS -->
          <div class="flex items-center justify-center mt-16 mb-8">
            <router-link to="/selectMoney">
              <button class="relative group overflow-hidden rounded-lg font-third-font font-bold text-xl md:text-2xl h-16 md:h-20 px-10 bg-white/5 border border-white/20 hover:border-white transition-all duration-300">
                <div class="absolute inset-0 w-0 bg-white transition-all duration-300 ease-out group-hover:w-full"></div>
                <span class="relative z-10 flex items-center justify-center h-full tracking-widest text-white group-hover:text-black">
                  RANDOMIZE WEAPONS
                </span>
              </button>
            </router-link>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      numberAgent: 1,
      agents: [],
      result: [],
      loading: true
    };
  },
  mounted() {
    this.fetchAgents();
    document.title = "Deadlock - Agents";
  },
  methods: {
    async fetchAgents() {
      try {
        this.loading = true;
        // L'URL relative fonctionne avec le proxy configuré dans vite.config.js
        const response = await axios.get('/api/agents');
        this.agents = response.data.filter(agent => agent.playable);
      } catch (error) {
        console.error("Erreur lors de la récupération des agents :", error);
      } finally {
        this.loading = false;
      }
    },
    increment() {
      if (this.numberAgent < 5) {
        this.numberAgent++;
      }
    },
    decrement() {
      if (this.numberAgent > 1) {
        this.numberAgent--;
      }
    },
    randomizeAgent() {
      this.result = [];
      if (this.numberAgent <= 0 || this.numberAgent > 5) {
        alert("Nombre d'agents incorrect");
        return;
      }

      const agentsCopy = [...this.agents];
      while (this.result.length < this.numberAgent) {
        if (agentsCopy.length === 0) break;
        const randomIndex = Math.floor(Math.random() * agentsCopy.length);
        const selectedAgent = agentsCopy.splice(randomIndex, 1)[0];
        this.result.push(selectedAgent);
      }
    },
    randomizeSingleAgent(index) {
      const agentsCopy = [...this.agents];
      let newAgent;

      // Si on a moins d'agents dispo que ce qu'on demande, éviter la boucle infinie
      if (agentsCopy.length <= this.result.length) {
        return; 
      }

      do {
        const randomIndex = Math.floor(Math.random() * agentsCopy.length);
        newAgent = agentsCopy[randomIndex];
      } while (this.result.includes(newAgent));

      this.result[index] = newAgent;
    }
  },
};
</script>

<style scoped>
/* Vue Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>