import { Component, HostListener, input, output } from '@angular/core';

/**
 * Modal estándar del panel. Contenido en el cuerpo y botones en [pie]:
 *   <app-admin-modal titulo="Crear aula" (cerrar)="...">
 *     ...campos...
 *     <div pie>...botones...</div>
 *   </app-admin-modal>
 */
@Component({
  selector: 'app-admin-modal',
  template: `
    <div class="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-[1px]" (click)="cerrar.emit()"></div>
      <section role="dialog" aria-modal="true" [attr.aria-labelledby]="idTitulo"
               class="relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
               [class]="ancho[tamano()]">
        <header class="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div class="min-w-0">
            <h2 [id]="idTitulo" class="text-lg font-semibold text-gray-900">{{ titulo() }}</h2>
            @if (descripcion()) { <p class="mt-0.5 text-sm text-gray-500">{{ descripcion() }}</p> }
          </div>
          <button type="button" (click)="cerrar.emit()" aria-label="Cerrar"
                  class="-mr-2 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </header>
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <ng-content />
        </div>
        <footer class="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4 sm:flex-row sm:justify-end sm:rounded-b-2xl">
          <ng-content select="[pie]" />
        </footer>
      </section>
    </div>
  `,
})
export class AdminModalComponent {
  private static contador = 0;
  readonly idTitulo = `adm-modal-${++AdminModalComponent.contador}`;

  titulo = input.required<string>();
  descripcion = input<string>();
  tamano = input<'sm' | 'md' | 'lg'>('md');
  readonly ancho = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' } as const;
  cerrar = output<void>();

  @HostListener('document:keydown.escape')
  alPresionarEscape() {
    this.cerrar.emit();
  }
}
