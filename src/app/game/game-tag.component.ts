import { Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import { BoardService } from './board/board.service';
import { BoardComponent } from './board/board.component';
import { Board, Game, Event, GameTreeNode, GameMoveTreeNode, ChessInfoObject } from './interface';
import { GameService } from './game.service';

@Component({
  selector: 'game-tag',
  templateUrl: './game-tag.component.html',
  styleUrls: ['./game-tag.component.scss']
})
export class GameTagComponent implements OnInit {

  @Input() gameTreeNode: GameTreeNode;
  tagValue: string;
  
  constructor() { }

  ngOnInit(): void {
   
  }

  ngOnChanges(): void {
     this.tagValue = this.gameTreeNode.tags.map(tag => tag.val).toString();
  }

  onChangeTags(): void {
    const tags: string[] = this.tagValue.split(',');
    const newTags: string[] = [];
    for(let tag of tags) {
      let exist: boolean = false;
      for(let gameTag of this.gameTreeNode.tags) {
        if(gameTag.val == tag) {
          exist = true;
          break;
        }
      }
      if(!exist) {
        newTags.push(tag);
      }
    }
    for(let newTag of newTags) {
      this.gameTreeNode.tags.push({val: newTag, isNew: true} as ChessInfoObject<string>);
    }
  }

}
