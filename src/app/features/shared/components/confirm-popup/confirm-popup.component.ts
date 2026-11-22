import { Component, HostListener, output, input } from '@angular/core';

@Component({
  selector: 'app-confirm-popup',
  imports: [],
  templateUrl: './confirm-popup.component.html',
  styleUrl: './confirm-popup.component.css',
})
export class ConfirmPopupComponent {
  isActive = input<boolean>();
  confirm = output<boolean>();
  popupName = input<string>();
  titulo = input<string>();
  mensaje = input<string>();
  textoConfirmar = input('Desactivar');

  @HostListener('document:keydown.escape')
  alPresionarEscape() {
    this.onCancel();
  }

  onConfirm() {
    this.confirm.emit(true);
  }

  onCancel() {
    this.confirm.emit(false);
  }

}
