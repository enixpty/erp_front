import { Component, inject,  Input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Toast, ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-custom-toast',
  imports: [ToastModule],
  providers: [MessageService],
  templateUrl: './custom-toast.html',
  styleUrl: './custom-toast.css',
})

export class CustomToast {
  private messageService = inject(MessageService);
  @Input() txtmessage: string = '';
  @Input() typesev: string='';
  @Input() title: string='';
  showSimple() { 
        this.messageService.add({ severity: this.typesev, summary: this.title, detail: this.txtmessage });
  }
}
