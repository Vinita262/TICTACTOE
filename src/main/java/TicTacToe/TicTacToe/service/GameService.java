
package TicTacToe.TicTacToe.service;

import TicTacToe.TicTacToe.TicTacToeGame;
import TicTacToe.TicTacToe.Model.Board;
import TicTacToe.TicTacToe.Model.PlayingPiece;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameService {

    private final Map<String, GameSession> games =
            new ConcurrentHashMap<>();

    public GameState createGame() {
        String gameId = UUID.randomUUID().toString();

        GameSession session = new GameSession();
        games.put(gameId, session);

        return getState(gameId, "Game created");
    }

    public GameState getState(String gameId, String message) {
        GameSession session = getSession(gameId);
        Board board = session.game.gameBoard;

        String[][] cells = new String[board.size][board.size];
        int moveCount = 0;

        for (int r = 0; r < board.size; r++) {
            for (int c = 0; c < board.size; c++) {
                PlayingPiece piece = board.board[r][c];

                if (piece != null) {
                    cells[r][c] = piece.pieceType.name();
                    moveCount++;
                }
            }
        }

        String currentPlayer = null;

        if ("IN_PROGRESS".equals(session.status)) {
            currentPlayer = moveCount % 2 == 0
                    ? "Player1"
                    : "Player2";
        }

        return new GameState(
                gameId,
                cells,
                currentPlayer,
                session.status,
                session.winner,
                message
        );
    }

    public GameState makeMove(
            String gameId, int row, int column) {

        GameSession session = getSession(gameId);

        if (!"IN_PROGRESS".equals(session.status)) {
            return getState(gameId, "Game has already ended");
        }

        int size = session.game.gameBoard.size;

        if (row < 0 || row >= size ||
                column < 0 || column >= size) {
            return getState(gameId, "Invalid row or column");
        }

        String result = session.game.startGame(row, column);

        if ("Invalid move".equals(result)) {
            return getState(gameId, "Cell is already occupied");
        }

        if ("tie".equals(result)) {
            session.status = "TIE";
            return getState(gameId, "Game ended in a tie");
        }

        if (!"continue".equals(result)) {
            session.status = "WON";
            session.winner = result;
            return getState(gameId, result + " wins!");
        }

        return getState(gameId, "Move successful");
    }

    private GameSession getSession(String gameId) {
        GameSession session = games.get(gameId);

        if (session == null) {
            throw new GameNotFoundException(
                    "Game not found: " + gameId);
        }

        return session;
    }

    private static class GameSession {
        private final TicTacToeGame game = new TicTacToeGame();
        private String status = "IN_PROGRESS";
        private String winner = null;
    }

    public record GameState(
            String gameId,
            String[][] board,
            String currentPlayer,
            String status,
            String winner,
            String message
    ) {}

    public static class GameNotFoundException
            extends RuntimeException {
        public GameNotFoundException(String message) {
            super(message);
        }
    }
}
