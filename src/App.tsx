import React, {useState} from 'react';
import {Viewer} from './Viewer';
import Chess, {ChessInstance} from 'chess.js';

const pgnTalFisch = `
[Event "Bled-Zagreb-Belgrade Candidates"]
[Site "Bled, Zagreb & Belgrade YUG"]
[Date "1959.10.11"]
[EventDate "1959.09.07"]
[Round "20"]
[Result "1-0"]
[White "Mikhail Tal"]
[Black "Robert James Fischer"]
[ECO "E93"]
[WhiteElo "?"]
[BlackElo "?"]
[PlyCount "67"]

1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Be2 O-O 6. Nf3 e5
7. d5 Nbd7 8. Bg5 h6 9. Bh4 a6 10. O-O Qe8 11. Nd2 Nh7 12. b4
Bf6 13. Bxf6 Nhxf6 14. Nb3 Qe7 15. Qd2 Kh7 16. Qe3 Ng8 17. c5
f5 18. exf5 gxf5 19. f4 exf4 20. Qxf4 dxc5 21. Bd3 cxb4
22. Rae1 Qf6 23. Re6 Qxc3 24. Bxf5+ Rxf5 25. Qxf5+ Kh8 26. Rf3
Qb2 27. Re8 Nf6 28. Qxf6+ Qxf6 29. Rxf6 Kg7 30. Rff8 Ne7
31. Na5 h5 32. h4 Rb8 33. Nc4 b5 34. Ne5 1-0
`.trim();

function App() {
  const [pgn, setPgn] = useState(pgnTalFisch);
  const [board, setBoard] = useState(null as ChessInstance|null);

  const playPgn = () => {
    // @ts-ignore
    const b = new Chess();
    b.load_pgn(pgn);
    setBoard(b);
  };

  return (
    <div className="App">
    <div>
      <textarea value={pgn} style={{height: 400, width: 500}} onChange={e => setPgn(e.target.value)} />
    </div>
    <div>
      <button type="submit" onClick={playPgn}>Play</button>
    </div>
    <div>
      {board && <Viewer game={board as ChessInstance} />}
    </div>
    </div>
  );
}

export default App;
