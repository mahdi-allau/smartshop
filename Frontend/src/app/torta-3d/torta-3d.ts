import { Component, computed, input, signal } from '@angular/core';

export interface FettaTorta {
  label: string;
  valore: number;
}

interface FettaCalcolata {
  label: string;
  valore: number;
  percentuale: number;
  colore: string;
  coloreLato: string;
  top: string;
  lato: string;
  /** spostamento (px) verso l'esterno quando la fetta è evidenziata */
  dx: number;
  dy: number;
}

const PALETTE = ['#4e79a7', '#f28e2b', '#59a14f', '#e15759', '#b07aa1', '#76b7b2', '#edc948', '#ff9da7'];

/** Scurisce un colore esadecimale (#rrggbb) per le pareti laterali. */
function scurisci(hex: string, fattore = 0.68): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * fattore);
  const g = Math.round(((n >> 8) & 255) * fattore);
  const b = Math.round((n & 255) * fattore);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Grafico a torta 3D (SVG puro, nessuna libreria esterna).
 * Uso: <app-torta-3d [dati]="[{ label: 'A', valore: 3 }, ...]" />
 */
@Component({
  selector: 'app-torta-3d',
  standalone: true,
  templateUrl: './torta-3d.html',
  styleUrls: ['./torta-3d.css']
})
export class Torta3d {
  dati = input<FettaTorta[]>([]);
  titolo = input<string>('');

  /** inclinazione in gradi: 0 = vista dall'alto, 90 = di taglio */
  inclinazione = signal(55);
  attiva = signal<number | null>(null);

  readonly larghezza = 460;
  readonly altezza = 290;
  private readonly cx = 230;
  private readonly cy = 140;
  private readonly r = 170;
  private readonly spessore = 34;

  readonly fette = computed<FettaCalcolata[]>(() => {
    const dati = this.dati().filter(d => d.valore > 0);
    const totale = dati.reduce((s, d) => s + d.valore, 0);
    if (!totale) return [];

    const ry = this.r * Math.cos((this.inclinazione() * Math.PI) / 180);
    const spessore = this.spessore * Math.sin((this.inclinazione() * Math.PI) / 180);
    let angolo = -Math.PI / 2; // si parte dall'alto

    return dati.map((d, i) => {
      const a0 = angolo;
      const a1 = angolo + (d.valore / totale) * Math.PI * 2;
      angolo = a1;
      const colore = PALETTE[i % PALETTE.length];
      const medio = (a0 + a1) / 2;
      return {
        label: d.label,
        valore: d.valore,
        percentuale: (d.valore / totale) * 100,
        colore,
        coloreLato: scurisci(colore),
        top: this.pathTop(a0, a1, ry),
        lato: this.pathLato(a0, a1, ry, spessore),
        dx: Math.cos(medio) * 10,
        dy: Math.sin(medio) * 10 * (ry / this.r)
      };
    });
  });

  private punto(a: number, ry: number): [number, number] {
    return [this.cx + this.r * Math.cos(a), this.cy + ry * Math.sin(a)];
  }

  private pathTop(a0: number, a1: number, ry: number): string {
    const [x0, y0] = this.punto(a0, ry);
    const [x1, y1] = this.punto(a1, ry);
    // fetta unica = cerchio intero: l'arco da solo non basta, la spezziamo in due metà
    if (a1 - a0 >= Math.PI * 2 - 1e-6) {
      const [xm, ym] = this.punto(a0 + Math.PI, ry);
      return `M ${x0} ${y0} A ${this.r} ${ry} 0 1 1 ${xm} ${ym} A ${this.r} ${ry} 0 1 1 ${x0} ${y0} Z`;
    }
    const grande = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${this.cx} ${this.cy} L ${x0} ${y0} A ${this.r} ${ry} 0 ${grande} 1 ${x1} ${y1} Z`;
  }

  /** Parete esterna: visibile solo nella metà "frontale" (angoli tra 0 e π). */
  private pathLato(a0: number, a1: number, ry: number, h: number): string {
    const s = Math.max(a0, 0);
    const e = Math.min(a1, Math.PI);
    if (e - s <= 1e-6) return '';
    const [xs, ys] = this.punto(s, ry);
    const [xe, ye] = this.punto(e, ry);
    return (
      `M ${xs} ${ys} A ${this.r} ${ry} 0 0 1 ${xe} ${ye} ` +
      `L ${xe} ${ye + h} A ${this.r} ${ry} 0 0 0 ${xs} ${ys + h} Z`
    );
  }

  totale = computed(() => this.dati().reduce((s, d) => s + Math.max(d.valore, 0), 0));

  cambiaInclinazione(event: Event) {
    this.inclinazione.set(+(event.target as HTMLInputElement).value);
  }
}
