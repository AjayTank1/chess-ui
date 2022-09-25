import { Component, OnInit, Input, Output, HostListener, EventEmitter } from '@angular/core';
import { Cell } from './../interface'

@Component({
  selector: 'cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements OnInit {

  @Input() cell: Cell;
  @Output() mouseUp = new EventEmitter<any>();
  @Output() mouseDown = new EventEmitter<any>();

  dark: boolean;
  src: string;

  constructor() {
    
  }

  ngOnInit(): void {
    this.dark = (this.cell.row + this.cell.col)%2 == 0;
  }
}