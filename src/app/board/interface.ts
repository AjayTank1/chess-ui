import { Cell, Piece } from './cell/interface';

export interface Board {
	cells: Cell[][];
	move: string;
	isKingUnderAttack: boolean;
	whiteKingPosition: Cell;
	blackKingPosition: Cell;
	whitePieces: Set<Cell>;
	blackPieces: Set<Cell>;
	whiteCapturedPieces: Set<Piece>;
	blackCapturedPieces: Set<Piece>;
	moveHistory: {from: {row: number, col: number}, to: {row: number, col: number}, char: string}[];

}

export interface MoveType {
	type?: string;
	valid: boolean;
	capture: boolean;
}