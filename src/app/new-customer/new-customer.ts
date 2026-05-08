import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import { CustomerService } from '../services/customer-service';
import { Customer } from '../model/customer_model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-customer',
  templateUrl: './new-customer.html',
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./new-customer.css'],
})
export class NewCustomer implements OnInit {
  newCustomerFormGroup!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.newCustomerFormGroup = this.fb.group({
      name: this.fb.control(null, [Validators.required, Validators.minLength(4)]),
      email: this.fb.control(null, [Validators.required, Validators.email]),
    });
  }

  handleSaveCustomer() {
    let customer: Customer = this.newCustomerFormGroup.value;
    this.customerService.saveCustomer(customer).subscribe({
      next: (data) => {
        alert('Customer has been successfully saved!');
        //this.newCustomerFormGroup.reset();
        this.router.navigateByUrl('/customers');
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
