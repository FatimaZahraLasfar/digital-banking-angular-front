import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, Observable, throwError } from 'rxjs';
import { AccountsService } from '../services/accounts.service';
import { AccountDetails } from '../model/account.model';
import { AsyncPipe, CommonModule, DatePipe, DecimalPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.html',
  standalone: true,
  styleUrls: ['./accounts.css'],
  imports: [
    RouterModule,CommonModule,
    ReactiveFormsModule,
    AsyncPipe,
    DecimalPipe,
    DatePipe,
    NgClass,
  ],
})
export class Accounts implements OnInit {
  accountFormGroup!: FormGroup;
  currentPage: number = 0;
  pageSize: number = 5;
  accountObservable!: Observable<AccountDetails>;
  operationFormGroup!: FormGroup;
  errorMessage!: string;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountsService,
  ) {}

  ngOnInit(): void {
    this.accountFormGroup = this.fb.group({
      accountId: this.fb.control(''),
    });

    this.operationFormGroup = this.fb.group({
      operationType: this.fb.control(null, Validators.required),
      amount: this.fb.control(0, [Validators.required, Validators.min(0.01)]),
      description: this.fb.control(null),
      accountDestination: this.fb.control(null),
    });

    // Conditional validator for accountDestination when operationType is TRANSFER
    this.operationFormGroup.get('operationType')?.valueChanges.subscribe((type) => {
      const destControl = this.operationFormGroup.get('accountDestination');
      if (type === 'TRANSFER') {
        destControl?.setValidators([Validators.required]);
      } else {
        destControl?.clearValidators();
      }
      destControl?.updateValueAndValidity();
    });
  }

  handleSearchAccount() {
    let accountId: string = this.accountFormGroup.value.accountId;
    if (!accountId) {
      this.errorMessage = 'Please enter an Account ID';
      return;
    }
    this.errorMessage = '';
    this.currentPage = 0;
    this.accountObservable = this.accountService
      .getAccount(accountId, this.currentPage, this.pageSize)
      .pipe(
        catchError((err) => {
          this.errorMessage = err.message;
          return throwError(err);
        }),
      );
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchAccount();
  }

  handleAccountOperation() {
    if (this.operationFormGroup.invalid) {
      Object.keys(this.operationFormGroup.controls).forEach((key) => {
        this.operationFormGroup.get(key)?.markAsTouched();
      });
      return;
    }

    let accountId: string = this.accountFormGroup.value.accountId;
    let operationType = this.operationFormGroup.value.operationType;
    let amount: number = this.operationFormGroup.value.amount;
    let description: string = this.operationFormGroup.value.description;
    let accountDestination: string = this.operationFormGroup.value.accountDestination;

    if (operationType === 'DEBIT') {
      this.accountService.debit(accountId, amount, description).subscribe({
        next: () => {
          alert('Success Debit');
          this.operationFormGroup.reset();
          this.handleSearchAccount();
        },
        error: (err) => console.log(err),
      });
    } else if (operationType === 'CREDIT') {
      this.accountService.credit(accountId, amount, description).subscribe({
        next: () => {
          alert('Success Credit'); // ✅ Fixed
          this.operationFormGroup.reset();
          this.handleSearchAccount();
        },
        error: (err) => console.log(err),
      });
    } else if (operationType === 'TRANSFER') {
      this.accountService.transfer(accountId, accountDestination, amount, description).subscribe({
        next: () => {
          alert('Success Transfer');
          this.operationFormGroup.reset();
          this.handleSearchAccount();
        },
        error: (err) => console.log(err),
      });
    }
  }
}
