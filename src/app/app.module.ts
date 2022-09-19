import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { BoardService } from './board/board.service';
import { CellComponent } from './board/cell/cell.component';
import { ModalComponent } from './board/modal/modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    CellComponent,
    ModalComponent,
  ],
  imports: [
    BrowserModule,
    MatDialogModule,
    NoopAnimationsModule,
  ],
  providers: [BoardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
