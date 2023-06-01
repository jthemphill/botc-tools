import React, { useContext } from "react";
import { CharacterInfo } from "../botc/roles";
import { goesInBag } from "../botc/setup";
import { CharacterCard, SelAction, Selection } from "./characters";
import { CharacterContext } from "./character_context";

export type Ranking = { [key: string]: number };

export function randomRanking(characters: CharacterInfo[]): Ranking {
  const ordering: number[] = [];
  for (var i = 0; i < characters.length; i++) {
    ordering.push(i);
  }
  ordering.sort(() => Math.random() - 0.5);
  var r: Ranking = {};
  characters.forEach((c, i) => {
    r[c.id] = ordering[i];
  })
  return r;
}

function ShuffleBag(props: {
  characters: CharacterInfo[],
  setRanking: (r: Ranking) => void,
}): JSX.Element {
  function handleClick() {
    props.setRanking(randomRanking(props.characters));
  }
  return <button className="btn" onClick={handleClick}>shuffle</button>;
}

function ClearSelection(props: {
  dispatch: (a: SelAction) => void,
}): JSX.Element {
  function handleClick() {
    props.dispatch({ type: "clear" });
  }
  return <button className="btn" onClick={handleClick}>clear</button>;
}

export function SelectedCharacters(props: {
  selection: Selection,
  ranking: Ranking,
  dispatch: (a: SelAction) => void,
  setRanking: (r: Ranking) => void,
}): JSX.Element {
  const characters = useContext(CharacterContext);
  const { selection, ranking, dispatch, setRanking } = props;
  var selected = characters.filter(char => selection.has(char.id));

  var bag = selected.filter(c => goesInBag(c.id));
  bag.sort((c1, c2) => ranking[c1.id] - ranking[c2.id]);
  var selectedOutsideBag = selected.filter(char => !goesInBag(char.id));
  return <div>
    <div className="selected-characters">
      <div className="column">
        <h2>Bag:
          <div className="spacer"></div>
          <ShuffleBag characters={characters} setRanking={setRanking}></ShuffleBag>
          <ClearSelection dispatch={dispatch}></ClearSelection>
        </h2>
        {bag.length == 0 && <span>No roles</span>}
        {bag.map(char =>
          <CharacterCard
            character={char}
            key={char.id}
            selected={false}
          />
        )}
      </div>
      <div className="column">
        {selectedOutsideBag.length > 0 && <h2>Outside bag:</h2>}
        {selectedOutsideBag.map(char =>
          <CharacterCard
            character={char}
            key={char.id}
            selected={false}
          />
        )}
      </div>
    </div>
  </div>;
}
