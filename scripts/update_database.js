const fs = require("fs");
const path = require("path");
const logger = require("../backend/logger");
const { saveSetsAndCards, getDataDir, saveBoosterRules } = require("../backend/data");
const doSet = require("../backend/import/doSet");

const updateDatabase = () => {
  let allCards = {};
  const allSets = {};
  let boosterRules = {};

  // Add normal sets
  const setsToIgnore = ["ITP", "CP1", "CP2", "CP3"];

  const setsDataDir = path.join(getDataDir(), "sets");
  if (fs.existsSync(setsDataDir) && false) {
    const files = fs.readdirSync(setsDataDir);
    files.forEach(file => {
      if (!/.json/g.test(file)) {
        return;
      }
      const [setName,] = file.split(".");
      if (setsToIgnore.includes(setName)) {
        return;
      }
      const filePath = path.join(setsDataDir, `${file}`);
      try {
        const json = JSON.parse(fs.readFileSync(filePath, "UTF-8")).data;
        if (json.code) {
          logger.info(`Found set to integrate ${json.code} with path ${filePath}`);
          const [set, cards] = doSet(json);
          allSets[json.code] = set;
          allCards = { ...allCards, ...cards };
          logger.info(`Parsing ${json.code} finished`);
        } else {
          logger.warn(`Set ${json.name} with path ${filePath} will NOT BE INTEGRATED`);
        }
      } catch (err) {
        logger.error(`Error while integrating the file ${filePath}: ${err.stack}`);
      }
    });
  }
  // Load custom sets from both data/custom (gitignored) and sets/ (tracked by git)
  const customSetDirs = [
    path.join(getDataDir(), "custom"),
    path.join(process.cwd(), "sets"),
  ];
  customSetDirs.forEach(customDataDir => {
    if (fs.existsSync(customDataDir)) {
      const files = fs.readdirSync(customDataDir);
      files.forEach(file => {
        // Integrate only json file
        if (/.json/g.test(file)) {
          const filePath = path.join(customDataDir, `${file}`);
          try {
            const json = JSON.parse(fs.readFileSync(filePath, "UTF-8"));
            if (json.code) {
              json.type = "custom";
              logger.info(`Found custom set to integrate ${json.code} with path ${filePath}`);
              const [set, cards] = doSet(json);
              allSets[json.code] = set;
              allCards = { ...allCards, ...cards };

              // Extract booster rules from custom sets if present
              if (json.booster && json.booster.default) {
                const boosterConfig = json.booster.default;
                const sheetNames = Object.keys(boosterConfig.sheets || {});
                const standardRarities = ['common', 'uncommon', 'rare', 'mythic', 'basic'];
                const hasNonStandardRarities = sheetNames.some(name => !standardRarities.includes(name.toLowerCase()));

                if (hasNonStandardRarities) {
                  boosterRules[json.code] = {
                    totalWeight: boosterConfig.boostersTotalWeight || 1,
                    boosters: boosterConfig.boosters.map(b => ({
                      sheets: b.contents,
                      weight: b.weight
                    })),
                    sheets: boosterConfig.sheets
                  };
                  logger.info(`Extracted booster rules for ${json.code} (non-standard rarities)`);
                }
              }

              logger.info(`Parsing ${json.code} finished`);
            }
          } catch (err) {
            logger.error(`Error while integrating the file ${filePath}: ${err.stack}`);
          }
        }
      });
    }
  });

  logger.info("Parsing AllSets.json finished");
  saveSetsAndCards(allSets, allCards);
  logger.info("Writing sets.json and cards.json finished");

  // Save booster rules if any were extracted
  if (Object.keys(boosterRules).length > 0) {
    saveBoosterRules(boosterRules);
    logger.info("Writing boosterRules.json finished");
  }
};

module.exports = updateDatabase;

if (!module.parent) {
  updateDatabase();
}
