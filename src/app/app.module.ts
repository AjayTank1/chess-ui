import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BoardComponent } from './game/board/board.component';
import { BoardService } from './game/board/board.service';
import { CellComponent } from './game/cell/cell.component';
import { ModalComponent } from './game/modal/modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GameComponent } from './game/game.component';
import { MoveDisplayComponent } from './game/move-display.component';
import { GameTagComponent } from './game/game-tag.component';
import { HttpClientModule } from '@angular/common/http';
import { GameService } from './game/game.service';
import { GameListComponent } from './game-list/game-list.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: 'analyze',
    component: GameListComponent,
  },
  {
    path: 'practice',
    component: GameListComponent,
  },
  {
    path: '',
    redirectTo: 'analyze',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    CellComponent,
    ModalComponent,
    GameComponent,
    GameListComponent,
    MoveDisplayComponent,
    GameTagComponent,
  ],
  imports: [
    BrowserModule,
    MatDialogModule,
    NoopAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    FormsModule
  ],
  providers: [BoardService, GameService],
  bootstrap: [AppComponent]
})
export class AppModule { }
