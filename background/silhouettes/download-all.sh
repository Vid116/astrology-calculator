#!/bin/bash
BASE_URL="https://raw.githubusercontent.com/Stellarium/stellarium/master/skycultures/modern/illustrations"

# All constellation filenames
FILES=(
  "antlia.png" "apus.png" "ara.png" "argonavis.png"
  "caelum.png" "camelopardalis.png" "canes-venatici.png"
  "chamaeleon.png" "circinus.png" "columba.png" "coma-berenices.png"
  "corona-australis.png" "corona-borealis.png" "corvus.png" "crater.png" "crux.png"
  "delphinus.png" "dorado.png" "draco.png"
  "equuleus.png" "eridanus.png"
  "fornax.png"
  "gemini.png" "grus.png"
  "hercules.png" "horlogium.png" "hydra.png" "hydrus.png"
  "indus.png"
  "lacerta.png" "leo.png" "leo-minor.png" "lepus.png" "libra.png" "lupus.png" "lynx.png" "lyra.png"
  "mensa.png" "microscopium.png" "monoceros.png" "musca.png"
  "norma.png"
  "octans.png" "ophiuchus.png" "orion.png"
  "pavo.png" "pegasus.png" "perseus.png" "phoenix.png" "pictor.png" "pisces.png" "piscis-austrinus.png" "pyxis.png"
  "reticulum.png"
  "sagitta.png" "sagittarius.png" "scorpius.png" "sculptor.png" "scutum.png" "sextans.png"
  "taurus.png" "telescopium.png" "triangulum.png" "triangulum-australe.png" "tucana.png"
  "ursa-major.png" "ursa-minor.png"
  "virgo.png" "volans.png" "vulpecula.png"
)

for file in "${FILES[@]}"; do
  echo "Downloading $file..."
  curl -sL -o "$file" "$BASE_URL/$file" &
  # Limit parallel downloads to 10
  if [[ $(jobs -r -p | wc -l) -ge 10 ]]; then
    wait -n
  fi
done
wait
echo "Done! Downloaded ${#FILES[@]} files."
