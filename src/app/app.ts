import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate, query, group } from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter, :leave', style({ position: 'absolute', width: '100%' }), {
          optional: true
        }),
        group([
          query(':leave', [
            style({ opacity: 1, transform: 'translateX(0)' }), // izquierda a derecha
            animate('500ms ease-out', style({ opacity: 0, transform: 'translateX(-100px)' })) //  izquierda  lento
          ], { optional: true }),
          query(':enter', [
            style({ opacity: 0, transform: 'translateX(100px)' }), // derecha
            animate('500ms ease-in', style({ opacity: 1, transform: 'translateX(0)' })) //  derecha lento
          ], { optional: true })
        ])
      ]),

      // desde arriba hacia abajo)
      transition('LoginPage <=> RegistroPage', [
        query(':enter, :leave', style({ position: 'absolute', width: '100%' }), {
          optional: true
        }),
        group([
          // Componente actual (Login o Registro) sale hacia arriba
          query(':leave', [
            style({ opacity: 1, transform: 'translateY(0)' }),
            animate('1000ms ease-out', style({ opacity: 0, transform: 'translateY(-100px)' }))
          ], { optional: true }),

          // Componente nuevo entra desde abajo
          query(':enter', [
            style({ opacity: 0, transform: 'translateY(100px)' }),
            animate('1000ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
          ], { optional: true })
        ])
      ])
    ])
  ]
})
export class App {
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}
