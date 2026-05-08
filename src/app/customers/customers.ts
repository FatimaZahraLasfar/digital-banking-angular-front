import { Component, OnInit } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';  // 👈 Import CommonModule
import { CustomerService } from '../services/customer-service';
import { Customer } from '../model/customer_model';

@Component({
  selector: 'app-customers',
  imports: [CommonModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  customers!: Observable<Array<Customer>>;
  errorMessage! : String;
  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.customers = this.customerService.getCustomers().pipe(
      catchError(err => {
        this.errorMessage = err;
        return throwError(err);
      })
    );
  }
}
