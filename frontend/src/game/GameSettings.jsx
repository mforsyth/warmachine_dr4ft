import React from "react";

import App from "../app";
import Checkbox from "../components/Checkbox";
import "./GameSettings.scss";

const GameSettings = () => (
  <div className='GameSettings'>
    <fieldset className='fieldset'>
      <legend className='legend game-legend'>Settings</legend>
      <span>
        <Checkbox side="left" text="Show chat" link="chat" />
        {!App.state.isSealed &&
          <Checkbox side="left" text="Enable notifications on new packs" link="beep" />
        }
        {!App.state.isSealed &&
          <div style={{paddingLeft: "10px"}} >
            <Checkbox side="left"
              text={App.state.notificationBlocked ? "Web notifications blocked in browser" : "Use desktop notifications over beep"}
              link="notify"
              disabled={!App.state.beep || App.state.notificationBlocked}
              onChange={App._emit("notification")} />
          </div>
        }
        {!App.state.isSealed &&
          <Checkbox side="left" text="Add picks to sideboard" link="side" />}
        <Checkbox side="left" text="Use column view" link="cols" />
      </span>
    </fieldset>
  </div>
);

export default GameSettings;
