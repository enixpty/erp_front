import { Injectable, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private breakpointObserver = inject(BreakpointObserver);

  // Observable que devuelve true si estamos en móvil (ancho menor a 960px)
  isMobile$ = this.breakpointObserver.observe(['(max-width: 960px)'])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
}
