import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dettaglio-ordine',
  templateUrl: './dettaglio-ordine.html',
  styleUrls: ['./dettaglio-ordine.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class OrdineDettaglioComponent implements OnInit {
  ordine: any = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get(`/orders/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe(res => {
      this.ordine = res;
    });
  }
}