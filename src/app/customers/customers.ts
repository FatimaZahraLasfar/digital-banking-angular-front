import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Customer } from '../model/customer_model';
import { CustomerService } from '../services/customer-service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.html',
  standalone : true,
  styleUrls: ['./customers.css'],
  imports: [AsyncPipe, ReactiveFormsModule],
})
export class Customers implements OnInit {
  customers!: Observable<Array<Customer>>;
  errorMessage!: string;
  searchFormGroup!: FormGroup;

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control(''),
    });
    this.handleSearchCustomers();
  }

  handleSearchCustomers() {
    let kw = this.searchFormGroup?.value.keyword;
    this.customers = this.customerService.searchCustomers(kw).pipe(
      catchError((err) => {
        this.errorMessage = err.message;
        return throwError(err);
      }),
    );
  }

  handleDeleteCustomer(c: Customer) {
    let conf = confirm('Are you sure?');
    if (!conf) return;
    this.customerService.deleteCustomer(c.id).subscribe({
      next: () => {
        // ✅ Simply refresh the whole list
        this.handleSearchCustomers();
      },
      error: (err) => {
        console.log(err);
        this.errorMessage = 'Failed to delete customer.';
      },
    });
  }

  handleCustomerAccounts(customer: Customer) {
    this.router.navigateByUrl('/customer-accounts/' + customer.id, { state: customer });
  }
}
