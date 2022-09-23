import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  public pieces = ['queen', 'knight', 'rook', 'bishop'];

  constructor(private dialogRef: MatDialogRef<ModalComponent>) { }

  ngOnInit(): void {
  }

  close(piece: string): void {
    this.dialogRef.close({piece});
  }

}
