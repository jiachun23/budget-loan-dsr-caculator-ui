<script lang="ts">
  import LoanCalculator from '$lib/components/LoanCalculator.svelte';
  import DSRCalculator from '$lib/components/DSRCalculator.svelte';
  
  // Tab state
  let activeTab = $state<'loan' | 'dsr'>('loan');
  
  // Shared state - monthly instalment from loan calculator
  let monthlyInstalment = $state(0);
  
  function handleLoanCalculated(instalment: number) {
    monthlyInstalment = instalment;
  }
</script>

<svelte:head>
  <title>Loan & DSR Calculator</title>
  <meta name="description" content="Calculate your loan payments and assess your Debt Service Ratio (DSR) for better financial planning." />
</svelte:head>

<!-- Tab Navigation -->
<div class="flex gap-2 mb-6">
  <button
    onclick={() => activeTab = 'loan'}
    class="flex-1 py-3 px-4 rounded-lg font-medium transition-all {activeTab === 'loan' ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}"
  >
    <div class="flex items-center justify-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
        <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
      </svg>
      Loan Calculator
    </div>
  </button>
  <button
    onclick={() => activeTab = 'dsr'}
    class="flex-1 py-3 px-4 rounded-lg font-medium transition-all {activeTab === 'dsr' ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}"
  >
    <div class="flex items-center justify-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      DSR Calculator
    </div>
  </button>
</div>

<!-- Tab Content -->
<div class="max-w-2xl mx-auto">
  {#if activeTab === 'loan'}
    <LoanCalculator onCalculated={handleLoanCalculated} />
    
    {#if monthlyInstalment > 0}
      <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-sm text-blue-700">
          💡 Your monthly instalment of <strong>RM {monthlyInstalment.toLocaleString()}</strong> is ready. 
          <button 
            onclick={() => activeTab = 'dsr'}
            class="underline font-medium hover:text-blue-800"
          >
            Calculate your DSR →
          </button>
        </p>
      </div>
    {/if}
  {:else}
    <DSRCalculator monthlyInstalment={monthlyInstalment} />
  {/if}
</div>

<!-- Info Section -->
<div class="mt-8 max-w-2xl mx-auto">
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">How to Use</h3>
    
    <div class="space-y-4">
      <div class="flex gap-3">
        <div class="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
          1
        </div>
        <div>
          <h4 class="font-medium text-gray-800">Calculate Your Loan</h4>
          <p class="text-sm text-gray-600">Enter your property/car price, downpayment, interest rate, and loan period to calculate your monthly instalment.</p>
        </div>
      </div>
      
      <div class="flex gap-3">
        <div class="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
          2
        </div>
        <div>
          <h4 class="font-medium text-gray-800">Set Your Budget (Optional)</h4>
          <p class="text-sm text-gray-600">Enter your target monthly budget to see if the loan fits and get suggestions to adjust.</p>
        </div>
      </div>
      
      <div class="flex gap-3">
        <div class="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
          3
        </div>
        <div>
          <h4 class="font-medium text-gray-800">Calculate Your DSR</h4>
          <p class="text-sm text-gray-600">Add your monthly expenses and income to assess your Debt Service Ratio and affordability.</p>
        </div>
      </div>
    </div>
  </div>
</div>
