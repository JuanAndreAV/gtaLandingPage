import { Component, input } from '@angular/core';

/** Encabezado estándar de las pantallas del panel: sección, título, descripción y acciones. */
@Component({
  selector: 'app-admin-page-header',
  template: `
    <header class="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        @if (seccion()) {
          <p class="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-inst-600">{{ seccion() }}</p>
        }
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">{{ titulo() }}</h1>
        @if (descripcion()) {
          <p class="mt-1 max-w-2xl text-sm text-gray-500">{{ descripcion() }}</p>
        }
      </div>
      <div class="flex shrink-0 flex-wrap items-center gap-2">
        <ng-content select="[acciones]" />
      </div>
    </header>
  `,
})
export class AdminPageHeaderComponent {
  titulo = input.required<string>();
  descripcion = input<string>();
  seccion = input<string>();
}
