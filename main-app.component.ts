import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// __define-pcb__
@Component({
  selector: 'app-area',
  standalone: true,
  imports: [CommonModule],
  template: `
    <select id="dropdown" (change)="sort($event)">
      <option value="title">A-Z by title</option>
      <option value="id">Id ascending</option>
    </select>
    <ol>
      <li *ngFor="let p of list">{{ p.title }}</li>
    </ol>
  `,
  styles: []
})
export class MainAppComponent implements OnInit {
  list = [];
  varPcb = 'title';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get('https://coderbyte.com/api/challenges/json/all-posts').subscribe((res) => {
      if (Array.isArray(res)) {
        this.list = res;
      } else if (res && res.posts) {
        this.list = res.posts;
      } else {
        this.list = [];
      }
      this.doSort();
    });
  }

  sort(e) {
    this.varPcb = e.target.value;
    this.doSort();
  }

  doSort() {
    if (this.varPcb === 'id') {
      this.list = this.list.slice().sort((a, b) => a.id - b.id);
    } else {
      this.list = this.list.slice().sort((a, b) => a.title.localeCompare(b.title));
    }
  }
}
