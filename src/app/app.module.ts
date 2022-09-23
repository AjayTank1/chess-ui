import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { BoardService } from './board/board.service';
import { CellComponent } from './board/cell/cell.component';
import { ModalComponent } from './board/modal/modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GameComponent } from './game/game.component';
import { HttpClientModule } from '@angular/common/http';
import { GameService } from './game/game.service';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    CellComponent,
    ModalComponent,
    GameComponent,
  ],
  imports: [
    BrowserModule,
    MatDialogModule,
    NoopAnimationsModule,
    HttpClientModule,
  ],
  providers: [BoardService, GameService],
  bootstrap: [AppComponent]
})
export class AppModule { }
