import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

import {  NgTemplateOutlet } from '@angular/common';
@Component({
  selector: 'app-custom-modal',
  imports: [DialogModule, NgTemplateOutlet],
  templateUrl: './custom-modal.html',
  styleUrl: './custom-modal.css',
})
export class CustomModal {
@Input() actionsTemplate: TemplateRef<any> | null = null;
@Input() InputVisible : boolean = false
@Input() InputHeader : string  =''
@Output() InputVisibleChange = new EventEmitter<boolean>();

  // 📌 Función que se llama cuando p-dialog se cierra (vía la 'X' o la tecla ESC)
onModalHide() { 
    // Emitimos 'false' para decirle al componente padre que se cierre
    this.InputVisibleChange.emit(false);
  }
}
