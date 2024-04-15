import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  animal: string;
  name: string;
}

/**
 * @title Dialog Overview
 */

@Component({
    selector: 'dialog-date',
    templateUrl: 'dialog-date.html',
  })
export class DialogDate {
  constructor(
    public dialogRef: MatDialogRef<DialogDate>
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}


/**  Copyright 2022 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at https://angular.io/license */