import React from "react";
import App from "../app";
import "./LeaderProfile.scss";

/**
 * Parse "KEY: val, KEY2: val2, ..." into { KEY: "val", KEY2: "val2" }
 */
function parseStats(text) {
  const stats = {};
  if (!text) return stats;
  const pairs = text.split(",").map(s => s.trim());
  for (const pair of pairs) {
    const idx = pair.indexOf(":");
    if (idx > 0) {
      stats[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
    }
  }
  return stats;
}

/**
 * Parse weapon card text into structured data.
 * Format: "Type: melee\nMAT: 6, RNG: 1, POW: 14\nAbility text..."
 */
function parseWeapon(card) {
  const lines = (card.text || "").split("\n");
  let weaponType = "";
  const stats = {};
  const abilities = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("Type:")) {
      weaponType = trimmed.replace("Type:", "").trim();
    } else if (/^(MAT|RAT|RNG|ROF|AOE|POW)\s*:/.test(trimmed)) {
      // Stats line like "RNG: 2, POW: 17" or "MAT: 6, RNG: 1, POW: 14"
      Object.assign(stats, parseStats(trimmed));
    } else if (trimmed) {
      abilities.push(trimmed);
    }
  }

  return { name: card.name, weaponType, stats, abilities, originLeader: card.originLeader };
}

/**
 * Substitute _LEADER_NAME_ placeholder with drafter name.
 */
function sub(text) {
  if (!text) return "";
  const name = (App.state.name || "").trim() || "Drafter";
  return text.split("_LEADER_NAME_").join(name);
}

const PROFILE_STAT_ORDER = ["SPD", "AAT", "MAT", "RAT", "DEF", "ARM", "ARC", "CTRL"];
const WEAPON_MELEE_STATS = ["MAT", "RNG", "POW"];
const WEAPON_RANGED_STATS = ["RAT", "RNG", "ROF", "AOE", "POW"];
const SPELL_STAT_ORDER = ["COST", "RNG", "AOE", "DUR", "OFF"];

const StatBar = ({ stats, order, className }) => {
  const entries = order.filter(k => stats[k] != null && stats[k] !== undefined);
  if (!entries.length) return null;
  return (
    <div className={`stat-bar ${className || ""}`}>
      {entries.map(k => (
        <div className="stat-cell" key={k}>
          <span className="stat-label">{k}</span>
          <span className="stat-value">{stats[k]}</span>
        </div>
      ))}
    </div>
  );
};

const CollapsibleSection = ({ title, children, className }) => {
  const [open, setOpen] = React.useState(false);
  if (!children) return null;
  return (
    <div className={`collapsible ${className || ""}`}>
      <div className="collapsible-header" onClick={() => setOpen(!open)}>
        <span className="collapsible-arrow">{open ? "▼" : "▶"}</span>
        <span className="collapsible-title">{title}</span>
      </div>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  );
};

const ProfileSection = ({ cards }) => {
  if (!cards.length) return null;
  // Merge all profile stats; use the last-drafted values for conflicts
  const merged = {};
  for (const card of cards) {
    Object.assign(merged, parseStats(card.text));
  }

  const health = merged["Health"];
  const base = merged["BASE"];

  return (
    <div className="lp-section lp-profile">
      <div className="lp-profile-header">
        <div className="lp-profile-name">{sub("_LEADER_NAME_")}</div>
        {base && <div className="lp-base-size">{base}</div>}
      </div>
      {health && (
        <div className="lp-health">
          <span className="lp-health-icon">♥</span>
          <span className="lp-health-value">{health}</span>
        </div>
      )}
      <StatBar stats={merged} order={PROFILE_STAT_ORDER} className="profile-stats" />
    </div>
  );
};

const WeaponsSection = ({ cards }) => {
  if (!cards.length) return null;
  const weapons = cards.map(parseWeapon);
  return (
    <div className="lp-section lp-weapons">
      <div className="lp-section-label">WEAPONS</div>
      {weapons.map((w, i) => {
        const statOrder = w.weaponType === "ranged" ? WEAPON_RANGED_STATS : WEAPON_MELEE_STATS;
        return (
          <div key={i} className={`lp-weapon lp-weapon-${w.weaponType || "melee"}`}>
            <div className="lp-weapon-header">
              <span className="lp-weapon-name">{w.name}</span>
              <StatBar stats={w.stats} order={statOrder} className="weapon-stats" />
            </div>
            {w.abilities.length > 0 && (
              <CollapsibleSection title={w.abilities[0].split(" - ")[0]}>
                {w.abilities.map((a, j) => <div key={j} className="lp-ability-text">{sub(a)}</div>)}
              </CollapsibleSection>
            )}
          </div>
        );
      })}
    </div>
  );
};

const FeatSection = ({ cards }) => {
  if (!cards.length) return null;
  return (
    <div className="lp-section lp-feats">
      <div className="lp-section-label">FEAT</div>
      {cards.map((card, i) => (
        <div key={i} className="lp-feat">
          <CollapsibleSection title={card.name}>
            <div className="lp-ability-text">{sub(card.text)}</div>
          </CollapsibleSection>
        </div>
      ))}
    </div>
  );
};

const SpellsSection = ({ cards }) => {
  if (!cards.length) return null;
  return (
    <div className="lp-section lp-spells">
      <div className="lp-section-label">SPELLS</div>
      {cards.map((card, i) => {
        const stats = card.spellStats || {};
        return (
          <div key={i} className="lp-spell">
            <div className="lp-spell-header">
              <span className="lp-spell-name">{card.name}</span>
              <StatBar stats={stats} order={SPELL_STAT_ORDER} className="spell-stats" />
            </div>
            {card.text && (
              <CollapsibleSection title={card.name}>
                <div className="lp-ability-text">{sub(card.text)}</div>
              </CollapsibleSection>
            )}
          </div>
        );
      })}
    </div>
  );
};

const AbilitiesSection = ({ cards }) => {
  if (!cards.length) return null;
  return (
    <div className="lp-section lp-abilities">
      <div className="lp-section-label">ABILITIES</div>
      {cards.map((card, i) => (
        <div key={i} className="lp-ability">
          <CollapsibleSection title={card.name}>
            <div className="lp-ability-text">{sub(card.text)}</div>
          </CollapsibleSection>
        </div>
      ))}
    </div>
  );
};

const LeaderProfile = ({ cards }) => {
  if (!cards || !cards.length) return null;

  const profiles = cards.filter(c => c.rarity === "Profile");
  const weapons = cards.filter(c => c.rarity === "Weapon");
  const feats = cards.filter(c => c.rarity === "Feat");
  const spells = cards.filter(c => c.rarity === "Spell");
  const abilities = cards.filter(c => c.rarity === "Ability");

  const hasCards = profiles.length || weapons.length || feats.length || spells.length || abilities.length;
  if (!hasCards) return null;

  return (
    <div className="LeaderProfile">
      <div className="lp-title">Leader Profile</div>
      <div className="lp-card">
        <ProfileSection cards={profiles} />
        <AbilitiesSection cards={abilities} />
        <WeaponsSection cards={weapons} />
        <FeatSection cards={feats} />
        <SpellsSection cards={spells} />
      </div>
    </div>
  );
};

export default LeaderProfile;
