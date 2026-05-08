import { Component, OnInit } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';  // 👈 Import CommonModule
import { CustomerService } from '../services/customer-service';
import { Customer } from '../model/customer_model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-customers',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  customers!: Observable<Array<Customer>>;
  errorMessage!: String;
  searchFormGroup: FormGroup | undefined;
  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control(null),
    });
    this.customers = this.customerService.getCustomers().pipe(
      catchError((err) => {
        this.errorMessage = err;
        return throwError(err);
      }),
    );
  }

  handleSearchCustomer() {
    let kw = this.searchFormGroup?.value.keyword;
  }
}
