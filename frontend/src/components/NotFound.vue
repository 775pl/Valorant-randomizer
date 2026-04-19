<template>
  <div class="absolute top-4 left-4">
    <a href="../accueil">
      <img src="../assets/img/valorant_randomizer.svg" alt="Valorant Randomizer" class="w-64 h-auto pt-6 pl-6" />
    </a>
  </div>
  <div class="not-found">
    <h1>404 - Page not found</h1>
    <p>Oops, we couldn't find the page you were looking for.</p>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  mounted() {
    // Changer le favicon lorsque le composant est monté
    document.title = "Page inconnue";

  }

};
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 50px;
  background-color: #f4f4f4;
  border: 1px solid #ccc;
  border-radius: 8px;
}

h1 {
  font-size: 3em;
  color: #eb565b;
}

p {
  font-size: 1.5em;
  color: #333;
}
</style>
