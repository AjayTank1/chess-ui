export interface Cell {
  row: number;
  col: number;
  piece?: Piece;
}

export interface Piece {
  color: string;
  char: string;
  url: string;
  isMoved: boolean;
}