import "../icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Distribution,
  distributionForCount,
  zeroDistribution,
} from "botc/setup";
import { SetStateAction } from "react";
import React from "react";

export function Distr({ dist }: { dist: Distribution }): JSX.Element {
  return (
    <span className="distribution">
      <span className="good">{dist.townsfolk}</span>/
      <span className="good">{dist.outsider}</span>/
      <span className="evil">{dist.minion}</span>/
      <span className="evil">{dist.demon}</span>
    </span>
  );
}

function BaseDistr({ numPlayers }: { numPlayers: number }): JSX.Element {
  const dist =
    5 <= numPlayers && numPlayers <= 15
      ? distributionForCount(numPlayers)
      : zeroDistribution();
  return <Distr dist={dist} />;
}

export function NumPlayerSelector(props: {
  numPlayers: number;
  setNumPlayers: React.Dispatch<SetStateAction<number>>;
  teenysville: boolean;
}): JSX.Element {
  const { numPlayers } = props;
  function handleIncDec(delta: number): () => void {
    return () => {
      props.setNumPlayers((n) => n + delta);
    };
  }

  const maxPlayers = props.teenysville ? 6 : 15;

  return (
    <div className="players">
      <div className="player-num-btns">
        <label htmlFor="minus-player-btn" className="visuallyhidden">
          subtract one player
        </label>
        <button
          id="minus-player-btn"
          title="subtract one player"
          disabled={numPlayers <= 5}
          onClick={handleIncDec(-1)}
        >
          <FontAwesomeIcon icon="minus" />
        </button>
        <span className="numPlayers">
          <span className="count">{numPlayers}</span>
          players
        </span>
        <label htmlFor="plus-player-btn" className="visuallyhidden">
          add one player
        </label>
        <button
          id="plus-player-btn"
          title="add one player"
          disabled={numPlayers >= maxPlayers}
          onClick={handleIncDec(+1)}
        >
          <FontAwesomeIcon icon="plus" />
        </button>
      </div>
      <div>
        <BaseDistr numPlayers={numPlayers} />
      </div>
    </div>
  );
}
