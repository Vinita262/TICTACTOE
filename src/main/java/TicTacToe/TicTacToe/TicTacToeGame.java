package TicTacToe.TicTacToe;

import TicTacToe.TicTacToe.Model.*;
//import org.antlr.v4.runtime.misc.Pair;

import java.util.Deque;
import java.util.LinkedList;
import java.util.List;
import java.util.Scanner;

public class TicTacToeGame {

    public Deque<Player> players;
    public Board gameBoard;

    public TicTacToeGame(){
        initializeGame();
    }

    public void initializeGame(){
        players = new LinkedList<>();
        PlayingPieceX crossPiece = new PlayingPieceX();
        Player player1 = new Player("Player1", crossPiece);
        PlayingPieceO noughtsPiece = new PlayingPieceO();
        Player player2 = new Player("Player2", noughtsPiece);

        players.add(player1);
        players.add(player2);

        gameBoard = new Board(3);
    }

    public String startGame(int row, int column){
        boolean noWinner = true;
//        while(noWinner){
        Player playerTurn = players.removeFirst();

        gameBoard.printBoard();

        System.out.println("Player:"+playerTurn.name+" Enter row,column: ");
//            Scanner inputScanner = new Scanner(System.in);
//            String s = inputScanner.nextLine();
//            String[] values = s.split(",");
//            int inputRow = Integer.valueOf(values[0]);
//            int inputColumn = Integer.valueOf(values[1]);

        int inputRow = row;
        int inputColumn = column;

        boolean pieceAddedSuccessfully = gameBoard.addPiece(inputRow,inputColumn,playerTurn.playingPiece);
        if(!pieceAddedSuccessfully){
            System.out.println("Incorrect positinon choosen, try again");
            players.addFirst(playerTurn);
            return "Invalid Move";
        }


        boolean winner = isThereWinner(inputRow,inputColumn,playerTurn.playingPiece.pieceType);
        if(winner){
            return playerTurn.name;
        }
//        }
        List<Pair<Integer,Integer>> freeSpaces = gameBoard.getFreeCells();
        if(freeSpaces.isEmpty()){
            noWinner = false;
            return "tie";
        }
        players.addLast(playerTurn);
        return "continue";
    }

    public boolean isThereWinner(int row, int column, PieceType pieceType){
        boolean rowMatch = true;
        boolean columnMatch = true;
        boolean diagonalMatch = true;
        boolean antidiagonalMatch = true;

        //rowcheck
        for(int i=0;i<gameBoard.size;i++){
            if(gameBoard.board[row][i] == null || gameBoard.board[row][i].pieceType != pieceType){
                rowMatch = false;
            }
        }

        //columncheck
        for(int i=0;i<gameBoard.size;i++){

            if(gameBoard.board[i][column]==null || gameBoard.board[i][column].pieceType != pieceType){
                columnMatch = false;
            }
        }

        //diagonalcheck

        for(int i=0;i<gameBoard.size;i++){

            if(gameBoard.board[i][i] == null || gameBoard.board[i][i].pieceType != pieceType){
                diagonalMatch = false;
            }
        }

        //antidiagnoalcheck

        for(int i=0;i<gameBoard.size;i++){

            if(gameBoard.board[i][gameBoard.size-1-i] == null || gameBoard.board[i][gameBoard.size-1-i].pieceType != pieceType){
                antidiagonalMatch = false;
            }
        }

        return rowMatch || columnMatch || diagonalMatch || antidiagonalMatch;
    }
}