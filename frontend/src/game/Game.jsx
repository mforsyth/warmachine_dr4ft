import React, {Component} from "react";

import App from "../app";

import PlayersPanel from "./PlayersPanel";
import StartPanel from "./StartPanel";
import DeckSettings from "./DeckSettings";
import GameSettings from "./GameSettings";
import Cols from "./Cols";
import Grid from "./Grid";
import Chat from "./Chat";
import {STRINGS} from "../config";

import {vanillaToast} from "vanilla-toast";
import "vanilla-toast/vanilla-toast.css";
import {ZONE_MAIN, ZONE_PACK, ZONE_SIDEBOARD} from "../zones";

export default class Game extends Component {
  constructor(props) {
    super(props);
    App.register(this);
  }

  leaveGame() {
    App.send("leave");
  }

  componentDidMount() {
    // Alert to set Leader Name and Signature Unit Type
    if (App.state.name === STRINGS.BRANDING.DEFAULT_USERNAME || !(App.state.modelType && App.state.modelType.trim())) {
      vanillaToast.warning(`Welcome, ${App.state.name}! Please set your Leader Name and Signature Unit Type via the 'Players' widget in the upper left.`, {duration: 6000});
    }

    window.addEventListener("beforeunload", this.leaveGame);
  }

  componentWillUnmount() {
    this.leaveGame();
    window.removeEventListener("beforeunload", this.leaveGame);
  }

  render() {
    return (
      <div className='container'>
        <audio id='beep' src='/media/beep.wav'/>
        <div className='game'>
          <div className='game-controls'>
            <div className='game-status'>
              <PlayersPanel/>
              <StartPanel/>
            </div>
            <DeckSettings/>
            <GameSettings/>
          </div>
          <CardsZone/>
        </div>
        {App.state.chat && <Chat/>}
      </div>
    );
  }
}

const CardsZone = () => {
  const pack = !App.state.isGameFinished && App.state.didGameStart
    ? <Grid key={"pack"} zones={[ZONE_PACK]} />
    : <div key={"pack"}/>;

  const props = { zones: [ZONE_MAIN, ZONE_SIDEBOARD] };
  const pool = App.state.cols
    ? <Cols key={"pool"} {...props}/>
    : <Grid key={"pool"} {...props} />;

  const showPool = !App.state.hidepicks || App.state.isGameFinished;

  return (
    <div>
      {pack}
      {showPool && pool}
    </div>
  );
};
