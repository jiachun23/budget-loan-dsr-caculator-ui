<script lang="ts">
  import { calculateDSR, type DSRResponse, type ExpenseItem } from '$lib/services/api';
  import { DSR_STATUS_COLORS } from '$lib/utils/categories';
  import ExpenseItemComponent from './ExpenseItem.svelte';
  import PieChart from './PieChart.svelte';
  
  interface Props {
    monthlyInstalment?: number;
  }
  
  let { monthlyInstalment = 0 }: Props = $props();
  
  // Form state
  let instalment = $state(0);
  let grossIncome = $state(8000);
  let netIncome = $state<number | undefined>(undefined);
  let includeNetIncome = $state(false);
  
  // Expenses
  let expenses = $state<ExpenseItem[]>([]);
  let totalExpenses = $derived(expenses.reduce((sum, e) => sum + e.amount, 0));
  
  // Results
  let result = $state<DSRResponse | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  
  // Sync instalment from parent
  $effect(() => {
    if (monthlyInstalment && monthlyInstalment > 0) {
      instalment = monthlyInstalment;
    }
  });
  
  function addExpense() {
    expenses = [...expenses, {
      category: 'Others',
      name: '',
      amount: 0
    }];
  }
  
  function removeExpense(index: number) {
    expenses = expenses.filter((_, i) => i !== index);
  }
  
  function updateExpense(index: number, field: 'category' | 'name' | 'amount', value: string | number) {
    expenses = expenses.map((expense, i) => {
      if (i === index) {
        return { ...expense, [field]: value };
      }
      return expense;
    });
  }
  
  async function handleCalculate() {
    loading = true;
    error = null;
    
    try {
      const data = {
        monthly_instalment: instalment,
        gross_income: grossIncome,
        net_income: includeNetIncome ? netIncome : undefined,
        expenses: expenses.filter(e => e.name && e.amount > 0)
      };
      
      result = await calculateDSR(data);
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
    instalment = monthlyInstalment || 0;
    grossIncome = 8000;
    netIncome = undefined;
    includeNetIncome = false;
    expenses = [];
    result = null;
    error = null;
  }
</script>

<div class="bg-white rounded-xl shadow-lg p-6">
  <h2 class="text-xl font-semibold text-gray-800 mb-6">DSR Calculator</h2>
  
  <!-- Input Form -->
  <div class="space-y-4">
    <div>
      <label for="instalment" class="block text-sm font-medium text-gray-700 mb-1">
        Monthly Loan Instalment (RM)
      </label>
      <input
        type="number"
        id="instalment"
        bind:value={instalment}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholder="1944.44"
      />
      {#if monthlyInstalment && monthlyInstalment > 0}
        <p class="text-xs text-gray-500 mt-1">Auto-filled from Loan Calculator</p>
      {/if}
    </div>
    
    <div>
      <label for="grossIncome" class="block text-sm font-medium text-gray-700 mb-1">
        Gross Monthly Income (RM)
      </label>
      <input
        type="number"
        id="grossIncome"
        bind:value={grossIncome}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholder="8000"
      />
    </div>
    
    <div class="border-t pt-4">
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          bind:checked={includeNetIncome}
          class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <span class="text-sm font-medium text-gray-700">Include Net Income</span>
      </label>
      
      {#if includeNetIncome}
        <div class="mt-3">
          <label for="netIncome" class="block text-sm font-medium text-gray-700 mb-1">
            Net Monthly Income (RM)
          </label>
          <input
            type="number"
            id="netIncome"
            bind:value={netIncome}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="6500"
          />
        </div>
      {/if}
    </div>
    
    <!-- Expenses Section -->
    <div class="border-t pt-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium text-gray-700">Monthly Expenses</h3>
        <button
          onclick={addExpense}
          class="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add Expense
        </button>
      </div>
      
      {#if expenses.length > 0}
        <div class="space-y-2 mb-3">
          {#each expenses as expense, index (index)}
            <ExpenseItemComponent
              category={expense.category}
              name={expense.name}
              amount={expense.amount}
              onDelete={() => removeExpense(index)}
              onUpdate={(field, value) => updateExpense(index, field, value)}
            />
          {/each}
        </div>
        
        <div class="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
          <span class="text-sm font-medium text-gray-700">Total Expenses:</span>
          <span class="text-lg font-semibold text-gray-800">{formatCurrency(totalExpenses)}</span>
        </div>
      {:else}
        <p class="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
          Click "Add Expense" to add your monthly expenses
        </p>
      {/if}
    </div>
    
    <!-- Buttons -->
    <div class="flex gap-3 pt-4">
      <button
        onclick={handleCalculate}
        disabled={loading || instalment <= 0 || grossIncome <= 0}
        class="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {loading ? 'Calculating...' : 'Calculate DSR'}
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
      <h3 class="text-lg font-semibold text-gray-800 mb-4">DSR Results</h3>
      
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Pie Chart -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="text-sm font-medium text-gray-700 mb-3 text-center">Expense Breakdown</h4>
          <PieChart data={result.expense_breakdown} />
        </div>
        
        <!-- DSR Result -->
        <div class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-500">Total Monthly Debt</p>
            <p class="text-xl font-semibold text-gray-800">{formatCurrency(result.total_monthly_debt)}</p>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-500">DSR Percentage</p>
            <p class="text-xl font-semibold text-gray-800">{result.dsr_percentage.toFixed(2)}%</p>
          </div>
          
          <div class="p-4 rounded-lg border {DSR_STATUS_COLORS[result.status as keyof typeof DSR_STATUS_COLORS]}">
            <p class="text-sm">Status</p>
            <p class="text-xl font-bold">{result.status}</p>
          </div>
        </div>
      </div>
      
      <!-- Recommendation -->
      <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 class="font-medium text-blue-800 mb-2">Recommendation</h4>
        <p class="text-sm text-blue-700">{result.recommendation}</p>
      </div>
      
      <!-- DSR Thresholds Info -->
      <div class="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 class="font-medium text-gray-700 mb-2">DSR Thresholds Guide</h4>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-green-500"></span>
            <span>Healthy: ≤ 30%</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span>Medium: 30% - 50%</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-orange-500"></span>
            <span>Caution: 50% - 70%</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-500"></span>
            <span>High Risk: > 70%</span>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
