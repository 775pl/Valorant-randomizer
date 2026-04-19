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
      WEAPONS
    </h1>
    <div class="text-2xl text-[#ece8e1] mt-4 font-third-font font-bold uppercase tracking-widest text-center">
      Choose your poison
    </div>

    <div class="glass-panel rounded-3xl p-8 md:p-12 mt-12 w-full max-w-4xl border border-white/10 shadow-[0_0_40px_rgba(255,70,85,0.05)]">
      
      <!-- Ligne 1 -->
      <div class="flex flex-col md:flex-row gap-6 md:gap-8 justify-center mb-6 md:mb-8">
        <button class="money-btn group" @click="sendMoney(800)">
          <div class="money-btn-content">
            <p class="money-title">Pistol</p>
            <p class="money-cost">¤ 800</p>
          </div>
        </button>
        <button class="money-btn group" @click="sendMoney(1100)">
          <div class="money-btn-content">
            <p class="money-title">Eco</p>
            <p class="money-cost">¤ 1100</p>
          </div>
        </button>
        <button class="money-btn group" @click="sendMoney(2700)">
          <div class="money-btn-content">
            <p class="money-title">Low buy</p>
            <p class="money-cost">¤ 2700</p>
          </div>
        </button>
      </div>

      <!-- Ligne 2 -->
      <div class="flex flex-col md:flex-row gap-6 md:gap-8 justify-center">
        <button class="money-btn group" @click="sendMoney(3500)">
          <div class="money-btn-content">
            <p class="money-title">Force buy</p>
            <p class="money-cost">¤ 3500</p>
          </div>
        </button>
        <button class="money-btn group" @click="sendMoney(4200)">
          <div class="money-btn-content">
            <p class="money-title">Full buy</p>
            <p class="money-cost">¤ 4200</p>
          </div>
        </button>
        <button class="money-btn group" @click="sendMoney(9000)">
          <div class="money-btn-content">
            <p class="money-title">Jeff buy</p>
            <p class="money-cost">¤ 9000</p>
          </div>
        </button>
      </div>
      
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    document.title = "Deadlock - Select Money";
  },
  methods: {
    sendMoney(cost) {
      this.$router.push({ name: 'RandomWeaponsSelector', params: { cost } });
    }
  }
};
</script>

<style scoped>
.money-btn {
  @apply relative overflow-hidden rounded-xl h-24 md:h-32 flex-1 min-w-[200px] bg-white/5 border border-white/10 hover:border-[#ff4655]/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(255,70,85,0.2)];
}

.money-btn::before {
  content: '';
  @apply absolute inset-0 w-0 bg-[#ff4655] transition-all duration-500 ease-out;
}

.money-btn:hover::before {
  @apply w-full;
}

.money-btn-content {
  @apply relative z-10 flex flex-col items-center justify-center h-full w-full font-third-font font-bold tracking-widest text-[#ece8e1] group-hover:text-white transition-colors duration-300;
}

.money-title {
  @apply text-xl md:text-2xl uppercase;
}

.money-cost {
  @apply text-[#ff4655] group-hover:text-white mt-1 text-lg opacity-80;
}
</style>