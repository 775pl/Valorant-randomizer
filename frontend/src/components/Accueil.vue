<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-white p-4">
    <!-- Main glass container -->
    <div class="glass-panel rounded-3xl p-10 md:p-16 flex flex-col items-center shadow-[0_0_40px_rgba(255,70,85,0.15)] max-w-4xl w-full">
      
      <!-- Valorant Randomizer Image -->
      <div class="mb-12 transform hover:scale-105 transition-transform duration-500">
        <img src="../assets/img/valorant_randomizer.svg" alt="Valorant Randomizer" class="w-64 md:w-96 drop-shadow-2xl" />
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-8 mt-4 w-full justify-center">
        <button 
          @click="$router.push('/selectAgents')" 
          class="relative group overflow-hidden rounded-lg font-third-font font-bold text-xl md:text-2xl h-20 md:h-24 px-8 w-full sm:w-auto min-w-[280px] bg-white/5 border border-white/10 hover:border-[#ff4655]/50 transition-all duration-300"
        >
          <div class="absolute inset-0 w-0 bg-[#ff4655] transition-all duration-300 ease-out group-hover:w-full"></div>
          <span class="relative z-10 flex items-center justify-center h-full tracking-widest group-hover:text-white text-[#ece8e1]">
            RANDOMIZE AGENTS
          </span>
          <div class="absolute bottom-0 right-0 w-3 h-3 bg-[#ff4655] group-hover:bg-white transition-colors duration-300"></div>
        </button>

        <button 
          @click="$router.push('/selectMoney')" 
          class="relative group overflow-hidden rounded-lg font-third-font font-bold text-xl md:text-2xl h-20 md:h-24 px-8 w-full sm:w-auto min-w-[280px] bg-white/5 border border-white/10 hover:border-[#ff4655]/50 transition-all duration-300"
        >
          <div class="absolute inset-0 w-0 bg-[#ff4655] transition-all duration-300 ease-out group-hover:w-full"></div>
          <span class="relative z-10 flex items-center justify-center h-full tracking-widest group-hover:text-white text-[#ece8e1]">
            RANDOMIZE WEAPONS
          </span>
          <div class="absolute bottom-0 right-0 w-3 h-3 bg-[#ff4655] group-hover:bg-white transition-colors duration-300"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Accueil',
  mounted() {
    document.title = "Deadlock - Accueil";
  }
};
</script>

<style scoped>
/* Scoped styles removed in favor of Tailwind classes and global glass utilities */
</style>
