import { Component, OnInit } from '@angular/core';
import { GameService } from './../game/game.service';
import { Board } from './../game/interface'

@Component({
  selector: 'game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {

  constructor(private gameService: GameService) { }
  game: Board[];
  ngOnInit(): void {
    this.gameService.getAllGame().subscribe(x=>{
      this.game = JSON.parse(x) as Board[];
    });
  }

}
