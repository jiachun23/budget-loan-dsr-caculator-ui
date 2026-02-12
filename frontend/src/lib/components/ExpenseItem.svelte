<script lang="ts">
  import { EXPENSE_CATEGORIES } from '$lib/utils/categories';
  
  interface Props {
    category: string;
    name: string;
    amount: number;
    onDelete: () => void;
    onUpdate: (field: 'category' | 'name' | 'amount', value: string | number) => void;
  }
  
  let { category, name, amount, onDelete, onUpdate }: Props = $props();
</script>

<div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
  <select
    value={category}
    onchange={(e) => onUpdate('category', e.currentTarget.value)}
    class="flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
  >
    {#each EXPENSE_CATEGORIES as cat}
      <option value={cat.value}>{cat.label}</option>
    {/each}
  </select>
  
  <input
    type="text"
    value={name}
    oninput={(e) => onUpdate('name', e.currentTarget.value)}
    placeholder="Expense name"
    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
  />
  
  <div class="relative">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">RM</span>
    <input
      type="number"
      value={amount}
      oninput={(e) => onUpdate('amount', parseFloat(e.currentTarget.value) || 0)}
      placeholder="0"
      class="w-32 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
    />
  </div>
  
  <button
    onclick={onDelete}
    class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
    title="Remove expense"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  </button>
</div>
