import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { BoardService } from './board/board.service';
import { CellComponent } from './board/cell/cell.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    CellComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [BoardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
