export interface GameTreeNode extends GameMoveTreeNode{
	board: Board;
	nodes: GameTreeNode[];
	char: string;
	color: string;
	parent?: GameTreeNode;
}

export interface GameMoveTreeNode {
	fromRow: number;
	fromCol: number;
	toRow: number;
	toCol: number;
	nodes: GameMoveTreeNode[],
}

export interface Game {
	boards: Board[];
	currentBoard: Board;
	moveHistory: {from: {row: number, col: number}, to: {row: number, col: number}, char: string}[];
}

export interface Board {
	cells: Cell[][];
	isKingUnderAttack: boolean;
	whiteKingPosition: Cell;
	blackKingPosition: Cell;
	whitePieces: Set<Cell>;
	blackPieces: Set<Cell>;
	whiteCapturedPieces: Set<Piece>;
	blackCapturedPieces: Set<Piece>;
}

export interface MoveType {
	type?: string;
	valid: boolean;
	capture: boolean;
}

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

export interface Event {
	move: number;
	tag?: string;
	promo: string;
}