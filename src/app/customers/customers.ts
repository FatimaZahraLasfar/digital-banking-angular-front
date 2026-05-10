import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../security/auth.service';
import { environment } from '../../environments/environment';

export interface Customer {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  searchKeyword = '';

  constructor(
    private http: HttpClient,
    public authService: AuthService        // public → accessible in template
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.http.get<Customer[]>(`${environment.backendHost}/customers`)
      .subscribe(data => this.customers = data);
  }

  searchCustomers(): void {
    if (!this.searchKeyword.trim()) {
      this.loadCustomers();
      return;
    }
    this.http
      .get<Customer[]>(`${environment.backendHost}/customers/search?keyword=${this.searchKeyword}`)
      .subscribe(data => this.customers = data);
  }

  deleteCustomer(customer: Customer): void {
    if (!confirm(`Delete customer "${customer.name}"?`)) return;
    this.http.delete(`${environment.backendHost}/customers/${customer.id}`)
      .subscribe(() => this.loadCustomers());
  }
}
