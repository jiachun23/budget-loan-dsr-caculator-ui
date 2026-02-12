<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  import { CATEGORY_COLORS } from '$lib/utils/categories';
  
  Chart.register(...registerables);
  
  interface Props {
    data: Record<string, number>;
  }
  
  let { data }: Props = $props();
  
  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;
  
  function createChart() {
    if (!canvas || !data) return;
    
    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = labels.map(label => CATEGORY_COLORS[label] || '#6B7280');
    
    if (chart) {
      chart.destroy();
    }
    
    chart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `RM ${value.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
  
  onMount(() => {
    createChart();
  });
  
  $effect(() => {
    if (data && canvas) {
      createChart();
    }
  });
  
  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
  });
</script>

<div class="w-full max-w-sm mx-auto">
  <canvas bind:this={canvas}></canvas>
</div>
