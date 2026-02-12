<script lang="ts">
  import { calculateLoan, type CalculateResponse } from '$lib/services/api';
  
  interface Props {
    onCalculated?: (monthlyInstalment: number) => void;
  }
  
  let { onCalculated }: Props = $props();
  
  // Form state
  let totalAmount = $state(500000);
  let downpayment = $state(100000);
  let interest = $state(3.5);
  let years = $state(30);
  let monthlyBudget = $state<number | undefined>(undefined);
  let useBudget = $state(false);
  
  // Results
  let result = $state<CalculateResponse | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  
  async function handleCalculate() {
    loading = true;
    error = null;
    
    try {
      const data = {
        total_amount: totalAmount,
        downpayment: downpayment,
        interest: interest,
        years: years,
        monthly_budget: useBudget ? monthlyBudget : undefined
      };
      
      result = await calculateLoan(data);
      
      // Call callback with monthly instalment
      if (onCalculated) {
        onCalculated(result.monthly_instalment);
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      loading = false;
    }
  }
  
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(value);
  }
  
  function resetForm() {
    totalAmount = 500000;
    downpayment = 100000;
    interest = 3.5;
    years = 30;
    monthlyBudget = undefined;
    useBudget = false;
    result = null;
    error = null;
  }
</script>

<div class="bg-white rounded-xl shadow-lg p-6">
  <h2 class="text-xl font-semibold text-gray-800 mb-6">Loan Calculator</h2>
  
  <!-- Input Form -->
  <div class="space-y-4">
    <div>
      <label for="totalAmount" class="block text-sm font-medium text-gray-700 mb-1">
        Property/Car Price (RM)
      </label>
      <input
        type="number"
        id="totalAmount"
        bind:value={totalAmount}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholder="500000"
      />
    </div>
    
    <div>
      <label for="downpayment" class="block text-sm font-medium text-gray-700 mb-1">
        Downpayment (RM)
      </label>
      <input
        type="number"
        id="downpayment"
        bind:value={downpayment}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholder="100000"
      />
    </div>
    
    <div>
      <label for="interest" class="block text-sm font-medium text-gray-700 mb-1">
        Interest Rate (% per year)
      </label>
      <input
        type="number"
        id="interest"
        step="0.01"
        bind:value={interest}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholder="3.5"
      />
    </div>
    
    <div>
      <label for="years" class="block text-sm font-medium text-gray-700 mb-1">
        Loan Period (years)
      </label>
      <input
        type="number"
        id="years"
        bind:value={years}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholder="30"
      />
    </div>
    
    <!-- Budget Toggle -->
    <div class="border-t pt-4 mt-4">
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          bind:checked={useBudget}
          class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <span class="text-sm font-medium text-gray-700">Set Monthly Budget</span>
      </label>
      
      {#if useBudget}
        <div class="mt-3">
          <label for="budget" class="block text-sm font-medium text-gray-700 mb-1">
            Monthly Budget (RM)
          </label>
          <input
            type="number"
            id="budget"
            bind:value={monthlyBudget}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="1500"
          />
        </div>
      {/if}
    </div>
    
    <!-- Buttons -->
    <div class="flex gap-3 pt-4">
      <button
        onclick={handleCalculate}
        disabled={loading}
        class="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {loading ? 'Calculating...' : 'Calculate'}
      </button>
      <button
        onclick={resetForm}
        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Reset
      </button>
    </div>
  </div>
  
  <!-- Error Message -->
  {#if error}
    <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
      {error}
    </div>
  {/if}
  
  <!-- Results -->
  {#if result}
    <div class="mt-6 border-t pt-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Results</h3>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-50 p-3 rounded-lg">
          <p class="text-sm text-gray-500">Loan Amount</p>
          <p class="text-lg font-semibold text-gray-800">{formatCurrency(result.loan_amount)}</p>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg">
          <p class="text-sm text-gray-500">Downpayment</p>
          <p class="text-lg font-semibold text-gray-800">{formatCurrency(result.downpayment)} ({result.downpayment_percentage}%)</p>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg">
          <p class="text-sm text-gray-500">Interest Rate</p>
          <p class="text-lg font-semibold text-gray-800">{result.interest_rate}</p>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg">
          <p class="text-sm text-gray-500">Loan Period</p>
          <p class="text-lg font-semibold text-gray-800">{result.loan_period}</p>
        </div>
      </div>
      
      <div class="mt-4 bg-primary-50 p-4 rounded-lg border border-primary-200">
        <p class="text-sm text-primary-600">Monthly Instalment</p>
        <p class="text-2xl font-bold text-primary-700">{formatCurrency(result.monthly_instalment)}</p>
      </div>
      
      <!-- Budget Comparison -->
      {#if result.budget_comparison}
        <div class="mt-4 p-4 rounded-lg border {result.budget_comparison.status === 'Within Budget' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}">
          <h4 class="font-semibold mb-3 {result.budget_comparison.status === 'Within Budget' ? 'text-green-800' : 'text-orange-800'}">
            Budget Comparison
          </h4>
          
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Your Budget:</span>
              <span class="font-medium">{formatCurrency(result.budget_comparison.budget)}</span>
            </div>
            <div class="flex justify-between">
              <span>Monthly Payment:</span>
              <span class="font-medium">{formatCurrency(result.budget_comparison.monthly_payment)}</span>
            </div>
            <div class="flex justify-between">
              <span>Difference:</span>
              <span class="font-medium {result.budget_comparison.difference >= 0 ? 'text-green-600' : 'text-red-600'}">
                {formatCurrency(result.budget_comparison.difference)}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Status:</span>
              <span class="font-medium {result.budget_comparison.status === 'Within Budget' ? 'text-green-600' : 'text-orange-600'}">
                {result.budget_comparison.status}
              </span>
            </div>
          </div>
          
          {#if result.budget_comparison.suggestions.length > 0}
            <div class="mt-4 pt-4 border-t border-orange-200">
              <h5 class="font-medium text-orange-800 mb-2">Suggestions to meet your budget:</h5>
              <ul class="space-y-2">
                {#each result.budget_comparison.suggestions as suggestion}
                  <li class="text-sm text-orange-700 flex items-start gap-2">
                    <span class="text-orange-500">•</span>
                    <span>{suggestion.message}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>
