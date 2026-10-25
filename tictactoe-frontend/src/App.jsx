import { useEffect, useState } from "react";
import { Circle, RotateCcw, Sparkles, X } from "lucide-react";

const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export default function App() {
    const [game, setGame] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    async function request(path, options = {}) {
        const response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.error || data.message || `Request failed: ${response.status}`
            );
        }

        return data;
    }

    async function newGame() {
        setBusy(true);
        setError("");
        setNotice("");

        try {
            const data = await request("/games", { method: "POST" });
            setGame(data);
            setNotice("A new game is ready!");
        } catch (e) {
            setError(
                `Cannot connect to the backend. Check that Spring Boot is running at ${API_BASE}. ${e.message}`
            );
        } finally {
            setBusy(false);
        }
    }

    async function makeMove(row, column) {
        if (
            !game ||
            busy ||
            game.status !== "IN_PROGRESS" ||
            game.board?.[row]?.[column]
        ) {
            return;
        }

        setBusy(true);
        setError("");
        setNotice("");

        try {
            const data = await request(
                `/games/${game.gameId}/moves`,
                {
                    method: "POST",
                    body: JSON.stringify({ row, column }),
                }
            );

            setGame(data);
            setNotice(data.message || "Move successful");
        } catch (e) {
            setError(e.message || "Could not submit your move.");
        } finally {
            setBusy(false);
        }
    }

    async function refreshGame() {
        if (!game?.gameId || busy) return;

        setBusy(true);
        setError("");

        try {
            const data = await request(`/games/${game.gameId}`);
            setGame(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        newGame();
    }, []);

    const board =
        game?.board ||
        Array.from({ length: 3 }, () => Array(3).fill(null));

    const finished = game && game.status !== "IN_PROGRESS";
    const isWinner = game?.status === "WON";
    const currentPlayer = game?.currentPlayer || "Player1";

    function renderMark(value) {
        if (value === "X") {
            return (
                <X
                    className="mark mark-x"
                    strokeWidth={2.7}
                    aria-label="X"
                />
            );
        }

        if (value === "O") {
            return (
                <Circle
                    className="mark mark-o"
                    strokeWidth={2.7}
                    aria-label="O"
                />
            );
        }

        return null;
    }

    return (
        <main className="page-shell">
            <header className="topbar">
                <a className="brand" href="/">
          <span className="brand-icon">
            <X size={20} />
            <Circle size={17} />
          </span>
                    <span>
            tic<span className="brand-accent">.</span>
            tac<span className="brand-accent">.</span>toe
          </span>
                </a>

                <div className="connection">
          <span
              className={`connection-dot ${error ? "offline" : ""}`}
          />
                    {error ? "Connection issue" : "Backend game"}
                </div>
            </header>

            <section className="hero">
                <div className="eyebrow">
                    <Sparkles size={14} /> THE CLASSIC, REIMAGINED
                </div>

                <h1>
                    Small board.
                    <br />
                    <span>Big brain energy.</span>
                </h1>

                <p className="hero-copy">
                    Three in a row wins it all. Take turns, think ahead,
                    and don't give away the corner.
                </p>
            </section>

            <section className="game-layout">
                <div className="board-card">
                    <div className="board-topline">
                        <div>
                            <div className="section-kicker">CURRENT MATCH</div>
                            <h2>
                                {!game
                                    ? "Loading game..."
                                    : finished
                                        ? isWinner
                                            ? `${game.winner} wins!`
                                            : "It's a draw!"
                                        : `${currentPlayer}'s turn`}
                            </h2>
                        </div>

                        <span
                            className={`turn-pill ${
                                currentPlayer === "Player2" ? "turn-o" : "turn-x"
                            }`}
                        >
              {finished
                  ? "FINISHED"
                  : `${currentPlayer === "Player1" ? "X" : "O"} TO PLAY`}
            </span>
                    </div>

                    <div className="board" role="group" aria-label="Tic-Tac-Toe board">
                        {board.map((row, r) =>
                                row.map((cell, c) => (
                                    <button
                                        key={`${r}-${c}`}
                                        className={`cell ${
                                            cell ? `cell-${cell.toLowerCase()}` : ""
                                        }`}
                                        onClick={() => makeMove(r, c)}
                                        disabled={
                                            busy || finished || Boolean(cell) || !game
                                        }
                                        aria-label={`Row ${r + 1}, column ${c + 1}`}
                                    >
                                        {renderMark(cell)}
                                        {!cell && (
                                            <span className="cell-number">
                      {String(r * 3 + c + 1).padStart(2, "0")}
                    </span>
                                        )}
                                    </button>
                                ))
                        )}
                    </div>

                    <div className="board-footer">
                        <span className="footer-dot" />
                        {busy
                            ? "Updating game..."
                            : finished
                                ? "Match complete"
                                : "Your move, make it count"}

                        <button
                            className="icon-button"
                            onClick={refreshGame}
                            disabled={!game || busy}
                            title="Refresh game state"
                            aria-label="Refresh game state"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>

                <aside className="side-panel">
                    <div className="side-card players-card">
                        <div className="section-kicker">PLAYERS</div>

                        <div
                            className={`player-row ${
                                !finished && currentPlayer === "Player1"
                                    ? "active-player"
                                    : ""
                            }`}
                        >
                            <div className="player-symbol symbol-x">
                                <X size={23} strokeWidth={2.8} />
                            </div>

                            <div className="player-info">
                                <strong>Player 1</strong>
                                <span>Crosses · X</span>
                            </div>

                            {!finished && currentPlayer === "Player1" && (
                                <span className="playing-tag">PLAYING</span>
                            )}
                        </div>

                        <div
                            className={`player-row ${
                                !finished && currentPlayer === "Player2"
                                    ? "active-player"
                                    : ""
                            }`}
                        >
                            <div className="player-symbol symbol-o">
                                <Circle size={21} strokeWidth={2.8} />
                            </div>

                            <div className="player-info">
                                <strong>Player 2</strong>
                                <span>Noughts · O</span>
                            </div>

                            {!finished && currentPlayer === "Player2" && (
                                <span className="playing-tag">PLAYING</span>
                            )}
                        </div>
                    </div>

                    <div className="side-card status-card">
                        <div className="section-kicker">MATCH STATUS</div>

                        <div className="status-line">
              <span
                  className={`status-indicator ${
                      finished ? "done" : ""
                  }`}
              />
                            {!game
                                ? "Loading"
                                : finished
                                    ? "Game over"
                                    : "In progress"}
                        </div>

                        <p>{game?.message || "Preparing your game..."}</p>

                        {game?.gameId && (
                            <div className="game-id">
                                <span>GAME ID</span>
                                <code>{game.gameId.slice(0, 8)}...</code>
                            </div>
                        )}
                    </div>

                    <button
                        className="new-game-button"
                        onClick={newGame}
                        disabled={busy}
                    >
                        <RotateCcw size={17} /> New game
                    </button>

                    <p className="hint">
                        Playing together on one screen? Take turns with a friend.
                        Every move is saved by your Java backend.
                    </p>
                </aside>
            </section>

            {(error || notice) && (
                <div
                    className={`toast ${error ? "toast-error" : ""}`}
                    role="status"
                >
                    <span>{error || notice}</span>

                    {error && (
                        <button
                            onClick={() => setError("")}
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>
                    )}
                </div>
            )}

            <footer className="page-footer">
                <span>BUILT FOR FRIENDLY COMPETITION</span>
                <span>3 × 3 · 2 PLAYERS · 1 WINNER</span>
            </footer>
        </main>
    );
}
