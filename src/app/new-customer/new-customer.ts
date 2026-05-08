import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-customer',
  imports: [ReactiveFormsModule],
  templateUrl: './new-customer.html',
  styleUrl: './new-customer.css',
})
export class NewCustomer implements OnInit {
  newCustomerFormGroup!: FormGroup;
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.newCustomerFormGroup = this.fb.group({
      name: this.fb.control(null),
      email: this.fb.control(null),
    });
  }

   handleSaveCustomer() {

  }
}
