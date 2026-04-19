<template>
  <div class="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center relative text-white">
    <!-- Back Button -->
    <div class="absolute top-8 left-8 z-50">
      <router-link to="/selectMoney" class="group flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div class="w-10 h-10 rounded-full glass-panel flex items-center justify-center border border-white/20 group-hover:border-[#ff4655] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white group-hover:text-[#ff4655] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </div>
      </router-link>
    </div>

    <!-- Title -->
    <h1 class="text-6xl md:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 font-secondary-font mb-12 pt-16 md:pt-24 tracking-wider uppercase text-center drop-shadow-lg">
      WEAPONS
    </h1>

    <div class="w-full max-w-7xl flex flex-col items-center">
      <!-- Loading State -->
      <div v-if="loading" class="text-xl font-third-font animate-pulse text-[#ff4655] my-12">
        Equipping weapons...
      </div>

      <!-- Liste des armes -->
      <transition-group name="fade" tag="div" class="flex justify-center flex-wrap gap-8 w-full">
        <div
            v-for="(item, index) in randomWeapons"
            :key="item.name + index"
            class="relative glass-panel rounded-2xl p-8 flex flex-col justify-between w-80 min-h-[24rem] group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,70,85,0.2)] overflow-hidden"
            :class="{ 'border-[#ff4655]/50': item.category === 'Armor' }"
        >
          <!-- Background accent -->
          <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-[#ff4655]/20 transition-colors duration-500"></div>

          <!-- Valo Logo Decoration -->
          <div :class="['absolute w-8 h-8 flex items-center justify-center bg-[#ff4655] rounded-br-lg z-20 top-0 left-0']">
             <img src="@/assets/img/weapons/logo-val.svg" class="w-4 h-4 invert">
          </div>

          <!-- Catégorie -->
          <div class="w-full text-center mb-8 z-10">
            <p class="font-third-font text-xl uppercase tracking-widest text-[#ece8e1]/70">
              {{ getText(item.category) }}
            </p>
          </div>

          <!-- Image Arme -->
          <div class="relative flex-grow flex justify-center items-center my-4 z-10 transition-transform duration-500 group-hover:scale-110">
            <img :src="item.icon" :alt="'Image de ' + item.name" class="max-h-32 w-auto object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"/>
          </div>

          <!-- Nom Arme -->
          <div class="w-full text-center mt-8 z-10">
            <h2 class="text-4xl font-secondary-font uppercase tracking-wider" :class="item.category === 'Armor' ? 'text-[#ff4655]' : 'text-white'">
              {{ item.name }}
            </h2>
          </div>

          <!-- Bouton TRY AGAIN -->
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
            <button
                @click="randomizeSingleWeapons(index)"
                class="bg-[#ff4655] hover:bg-white hover:text-[#ff4655] text-white font-third-font font-bold px-6 py-3 rounded-lg tracking-widest transition-colors duration-300 shadow-lg"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      </transition-group>

      <!-- Option Shield -->
      <div class="glass-panel mt-16 px-6 py-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors border border-white/10" @click="toggleShield">
        <div class="w-6 h-6 rounded border-2 flex items-center justify-center transition-colors" :class="includeShield ? 'border-[#ff4655] bg-[#ff4655]' : 'border-white/50'">
          <svg v-if="includeShield" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <span class="text-lg font-third-font uppercase tracking-wider text-[#ece8e1]">Include Armor</span>
      </div>

      <!-- Quick Money Actions -->
      <div class="flex flex-wrap justify-center gap-4 mt-12 mb-12 max-w-4xl">
        <button v-for="amount in [800, 1100, 2700, 3500, 4200, 9000]" :key="amount" 
          class="px-6 py-3 rounded-lg font-third-font font-bold tracking-widest border transition-all duration-300"
          :class="cost === amount ? 'bg-[#ff4655] border-[#ff4655] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)]' : 'bg-white/5 border-white/10 text-[#ece8e1] hover:border-white hover:bg-white/10'"
          @click="sendMoney(amount)"
        >
          ¤ {{ amount }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      items: [],
      randomWeapons: [],
      includeShield: false,
      cost: 0,
      loading: true
    };
  },
  async created() {
    try {
      this.loading = true;
      const weaponsResponse = await this.fetchApi('weapons');
      const gearsResponse = await this.fetchApi('gears');
      
      this.items = [...weaponsResponse, ...gearsResponse];
      
      if (this.$route.params.cost) {
        this.cost = parseInt(this.$route.params.cost, 10) || 0;
      }
      this.updateWeaponsBasedOnCost(this.cost);
    } catch (error) {
      console.error('Erreur de récupération des données:', error);
    } finally {
      this.loading = false;
    }
  },
  mounted() {
    document.title = "Deadlock - Weapons";
  },
  watch: {
    '$route.params.cost'(newCost) {
      this.cost = parseInt(newCost, 10) || 0;
      this.updateWeaponsBasedOnCost(this.cost);
    },
    includeShield() {
      this.updateWeaponsBasedOnCost(this.cost);
    }
  },
  methods: {
    toggleShield() {
      this.includeShield = !this.includeShield;
    },
    async fetchApi(type) {
      try {
        // Updated to use relative path for local proxy
        const response = await axios.get(`/api/${type}`);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        return [];
      }
    },
    updateWeaponsBasedOnCost(budget) {
      if (this.items.length === 0) return;

      const availableItems = this.items.filter(item => item.cost <= budget);

      const primaryWeapons = availableItems.filter(item => item.category !== 'Pistols' && item.category !== 'Armor');
      const secondaryWeapons = availableItems.filter(item => item.category === 'Pistols');
      const shields = this.includeShield ? availableItems.filter(item => item.category === 'Armor') : [];

      const randomSecondary = this.randomizeWeapon(secondaryWeapons);
      const randomPrimary = this.randomizeWeapon(primaryWeapons);
      const randomShield = this.randomizeWeapon(shields);

      this.randomWeapons = [...randomSecondary, ...randomPrimary, ...randomShield];
    },
    randomizeWeapon(weaponArray) {
      if (weaponArray.length === 0) return [];
      const randomWeapon = weaponArray[Math.floor(Math.random() * weaponArray.length)];
      return [randomWeapon];
    },
    sendMoney(cost) {
      this.$router.replace({ name: 'RandomWeaponsSelector', params: { cost } });
    },
    getText(category) {
      switch (category) {
        case 'Pistols':
          return 'Sidearm';
        case 'Armor':
          return 'Shield';
        default:
          return 'Primary';
      }
    },
    randomizeSingleWeapons(index) {
      const currentWeapon = this.randomWeapons[index];
      const isSecondary = currentWeapon.category === 'Pistols';
      const isArmor = currentWeapon.category === 'Armor';

      const filteredWeapons = this.items.filter(item => {
        if (item.cost > this.cost) return false;
        if (isArmor) return item.category === 'Armor';
        return isSecondary ? item.category === 'Pistols' : (item.category !== 'Pistols' && item.category !== 'Armor');
      });

      if (filteredWeapons.length <= 1) return; // No other options to randomize

      let newWeapon;
      do {
        const randomIndex = Math.floor(Math.random() * filteredWeapons.length);
        newWeapon = filteredWeapons[randomIndex];
      } while (newWeapon.name === currentWeapon.name);

      this.randomWeapons.splice(index, 1, newWeapon);
    }
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>

