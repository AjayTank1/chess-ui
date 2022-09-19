import { Cell, Piece } from './cell/interface';

export interface Board {
	cells: Cell[][];
	move: string;
	whitePieces: Set<Cell>;
	blackPieces: Set<Cell>;
	whiteCapturedPieces: Set<Piece>;
	blackCapturedPieces: Set<Piece>;

}

export interface MoveType {
	type?: string;
	valid: boolean;
}