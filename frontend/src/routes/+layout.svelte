<script lang="ts">
  import '../app.css';
  
  let { children } = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-bold text-gray-900">Loan & DSR Calculator</h1>
      <p class="text-sm text-gray-500">Calculate your loan payments and assess affordability</p>
    </div>
  </header>
  
  <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    {@render children()}
  </main>
  
  <footer class="bg-white border-t mt-auto">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <p class="text-center text-sm text-gray-500">
        Loan Calculator & DSR Assessment Tool
      </p>
    </div>
  </footer>
</div>
