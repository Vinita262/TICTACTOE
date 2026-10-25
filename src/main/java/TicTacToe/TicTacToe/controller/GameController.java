
package TicTacToe.TicTacToe.controller;

import TicTacToe.TicTacToe.service.GameService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000"
})
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    // Create a new game
    @PostMapping
    public GameService.GameState createGame() {
        return gameService.createGame();
    }

    // Get the current board and turn
    @GetMapping("/{gameId}")
    public GameService.GameState getGame(
            @PathVariable String gameId) {
        return gameService.getState(gameId, "Game state");
    }

    // Submit one move
    @PostMapping("/{gameId}/moves")
    public GameService.GameState makeMove(
            @PathVariable String gameId,
            @RequestBody MoveRequest request) {

        return gameService.makeMove(
                gameId, request.row(), request.column());
    }

    public record MoveRequest(int row, int column) {}

    @ExceptionHandler(GameService.GameNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(
            GameService.GameNotFoundException exception) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", exception.getMessage()));
    }
}
