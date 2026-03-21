# Scenario Expansion Plan

## Current State: 36 scenarios → Target: ~300

**36 scenarios** (16 original + 20 from Batch 1). Target: comprehensive world history collection across all continents, eras, and event types.

### Existing Scenarios (16 original)
thermopylae-480bc, crossing-rubicon-49bc, hastings-1066, constantinople-1453, spanish-armada-1588, french-revolution-1789, waterloo-1815, verdun-1916, d-day-1944, berlin-wall-1989, red-cliffs-208, meiji-restoration-1868, midway-1942, american-revolution-1776, cuban-missile-crisis-1962, zama-202bc

---

## Progress

### ✅ Batch 1 — COMPLETE (2026-03-21)
All 20 scenarios written: scenario.json, history.json, scenes/scene-001–003.json for each.
manifest.json updated with new `ancient-mediterranean` region (3 eras: Bronze Age, Classical Antiquity, Roman Imperial).

---

## Implementation Approach

Each scenario requires:
```
content/scenarios/{id}/
  ├── scenario.json      # Metadata, roles, key figures (trilingual: en, ja, zh-CN)
  ├── history.json       # Timeline, outcome, significance
  └── scenes/
      ├── scene-001.json  # Opening decision (2 choices)
      ├── scene-002.json  # Mid-point decision (2 choices)
      └── scene-003.json  # Terminal scene (2 outcomes)
```

---

## Batches (284 new scenarios, 15 batches)

### ✅ Batch 1 — Ancient Mediterranean & Near East (20) — COMPLETE

| # | ID | Title | Date | Region | Type |
|---|-----|-------|------|--------|------|
| 1 | `marathon-490bc` | Battle of Marathon | 490 BC | Europe | Military |
| 2 | `salamis-480bc` | Battle of Salamis | 480 BC | Europe | Naval |
| 3 | `peloponnesian-war-404bc` | Fall of Athens | 404 BC | Europe | Military/Political |
| 4 | `alexander-gaugamela-331bc` | Battle of Gaugamela | 331 BC | Middle East | Military |
| 5 | `alexander-india-326bc` | Alexander at the Hydaspes | 326 BC | Asia | Military |
| 6 | `caesar-assassination-44bc` | Assassination of Julius Caesar | 44 BC | Europe | Political |
| 7 | `actium-31bc` | Battle of Actium | 31 BC | Europe | Naval/Political |
| 8 | `cleopatra-egypt-30bc` | Fall of Ptolemaic Egypt | 30 BC | Africa | Political |
| 9 | `teutoburg-forest-9ad` | Battle of Teutoburg Forest | 9 AD | Europe | Military |
| 10 | `fall-of-jerusalem-70` | Siege of Jerusalem | 70 AD | Middle East | Military |
| 11 | `masada-73` | Siege of Masada | 73 AD | Middle East | Military/Political |
| 12 | `battle-of-kadesh-1274bc` | Battle of Kadesh | 1274 BC | Middle East | Military/Diplomatic |
| 13 | `trojan-war-1184bc` | Fall of Troy | ~1184 BC | Europe | Military/Legendary |
| 14 | `fall-of-babylon-539bc` | Fall of Babylon | 539 BC | Middle East | Military/Political |
| 15 | `hannibal-cannae-216bc` | Battle of Cannae | 216 BC | Europe | Military |
| 16 | `spartacus-revolt-73bc` | Spartacus Revolt | 73 BC | Europe | Revolution |
| 17 | `fall-of-carthage-146bc` | Fall of Carthage | 146 BC | Africa | Military |
| 18 | `boudicca-revolt-60` | Boudicca's Revolt | 60 AD | Europe | Revolution |
| 19 | `fall-of-rome-476` | Fall of Western Rome | 476 AD | Europe | Political/Military |
| 20 | `battle-of-alesia-52bc` | Battle of Alesia | 52 BC | Europe | Military |

### Batch 2 — Ancient & Classical Asia (20)

| # | ID | Title | Date | Region | Type |
|---|-----|-------|------|--------|------|
| 21 | `warring-states-changping-260bc` | Battle of Changping | 260 BC | Asia | Military |
| 22 | `qin-unification-221bc` | Qin Unification of China | 221 BC | Asia | Political/Military |
| 23 | `fall-of-qin-207bc` | Fall of the Qin Dynasty | 207 BC | Asia | Revolution |
| 24 | `chu-han-contention-202bc` | Chu-Han Contention | 202 BC | Asia | Military/Political |
| 25 | `han-xiongnu-war-133bc` | Han-Xiongnu War | 133 BC | Asia | Military |
| 26 | `three-kingdoms-guandu-200` | Battle of Guandu | 200 AD | Asia | Military |
| 27 | `zhuge-liang-northern-228` | Zhuge Liang's Northern Expeditions | 228 AD | Asia | Military |
| 28 | `fall-of-han-220` | Fall of the Han Dynasty | 220 AD | Asia | Political |
| 29 | `ashoka-kalinga-261bc` | Ashoka and the Kalinga War | 261 BC | Asia | Military/Cultural |
| 30 | `chandragupta-maurya-322bc` | Rise of the Maurya Empire | 322 BC | Asia | Political/Military |
| 31 | `kushan-empire-127` | Kanishka and the Kushan Empire | 127 AD | Asia | Political/Cultural |
| 32 | `talas-751` | Battle of Talas | 751 AD | Asia | Military |
| 33 | `goguryeo-sui-war-612` | Goguryeo-Sui War | 612 AD | Asia | Military |
| 34 | `baekgang-663` | Battle of Baekgang | 663 AD | Asia | Naval |
| 35 | `nara-heian-transition-794` | Heian Capital Transfer | 794 AD | Asia | Political/Cultural |
| 36 | `genpei-war-1185` | Genpei War — Dan-no-ura | 1185 | Asia | Naval/Military |
| 37 | `khmer-empire-angkor-1177` | Siege of Angkor | 1177 | Asia | Military |
| 38 | `srivijaya-trade-700` | Srivijaya Maritime Empire | ~700 AD | Asia | Economic/Political |
| 39 | `silk-road-crisis-100` | Silk Road Crisis | ~100 AD | Asia | Economic/Diplomatic |
| 40 | `funan-kingdom-250` | Rise of Funan | ~250 AD | Asia | Political |

### Batch 3 — Medieval Europe (20)

| # | ID | Title | Date | Region | Type |
|---|-----|-------|------|--------|------|
| 41 | `siege-of-orleans-1429` | Siege of Orléans | 1429 | Europe | Military |
| 42 | `tours-732` | Battle of Tours | 732 | Europe | Military |
| 43 | `charlemagne-coronation-800` | Coronation of Charlemagne | 800 | Europe | Political/Religious |
| 44 | `viking-siege-paris-885` | Viking Siege of Paris | 885 | Europe | Military |
| 45 | `norman-sicily-1061` | Norman Conquest of Sicily | 1061 | Europe | Military |
| 46 | `first-crusade-1099` | First Crusade — Siege of Jerusalem | 1099 | Europe/Middle East | Military/Religious |
| 47 | `third-crusade-1191` | Third Crusade — Arsuf | 1191 | Europe/Middle East | Military |
| 48 | `magna-carta-1215` | Magna Carta | 1215 | Europe | Political/Legal |
| 49 | `mongol-invasion-europe-1241` | Mongol Invasion of Europe | 1241 | Europe | Military |
| 50 | `bannockburn-1314` | Battle of Bannockburn | 1314 | Europe | Military |
| 51 | `black-death-1347` | The Black Death | 1347 | Europe | Crisis/Political |
| 52 | `agincourt-1415` | Battle of Agincourt | 1415 | Europe | Military |
| 53 | `wars-of-roses-1485` | Battle of Bosworth Field | 1485 | Europe | Military/Political |
| 54 | `reconquista-1492` | Fall of Granada | 1492 | Europe | Military/Religious |
| 55 | `peasants-revolt-1381` | English Peasants' Revolt | 1381 | Europe | Revolution |
| 56 | `hussite-wars-1420` | Hussite Wars | 1420 | Europe | Military/Religious |
| 57 | `hundred-years-war-crecy-1346` | Battle of Crécy | 1346 | Europe | Military |
| 58 | `fourth-crusade-1204` | Sack of Constantinople | 1204 | Europe | Military/Political |
| 59 | `sicilian-vespers-1282` | Sicilian Vespers | 1282 | Europe | Revolution |
| 60 | `swiss-independence-1315` | Battle of Morgarten | 1315 | Europe | Military/Political |

### Batch 4 — Medieval & Early Modern Islamic World & Africa (20)

| # | ID | Title | Date | Region | Type |
|---|-----|-------|------|--------|------|
| 61 | `islamic-conquest-jerusalem-637` | Siege of Jerusalem | 637 | Middle East | Military/Religious |
| 62 | `saladin-jerusalem-1187` | Saladin Retakes Jerusalem | 1187 | Middle East | Military |
| 63 | `mansa-musa-1324` | Mansa Musa's Pilgrimage | 1324 | Africa | Cultural/Economic |
| 64 | `mongol-invasion-1258` | Fall of Baghdad | 1258 | Middle East | Military |
| 65 | `ain-jalut-1260` | Battle of Ain Jalut | 1260 | Middle East | Military |
| 66 | `ottoman-rise-1389` | Battle of Kosovo | 1389 | Europe/Middle East | Military |
| 67 | `tamerlane-delhi-1398` | Tamerlane's Sack of Delhi | 1398 | Asia | Military |
| 68 | `songhai-empire-1493` | Rise of the Songhai Empire | 1493 | Africa | Political/Military |
| 69 | `great-zimbabwe-1300` | Great Zimbabwe | ~1300 | Africa | Political/Economic |
| 70 | `kilwa-sultanate-1200` | Kilwa Sultanate Golden Age | ~1200 | Africa | Economic/Political |
| 71 | `axum-conversion-340` | Conversion of Axum | 340 | Africa | Religious/Political |
| 72 | `ghana-empire-1076` | Fall of the Ghana Empire | 1076 | Africa | Military/Political |
| 73 | `mali-sundiata-1235` | Sundiata and the Mali Empire | 1235 | Africa | Military/Political |
| 74 | `almoravid-movement-1054` | Almoravid Movement | 1054 | Africa | Military/Religious |
| 75 | `ottoman-mohacs-1526` | Battle of Mohács | 1526 | Europe | Military |
| 76 | `ottoman-lepanto-1571` | Battle of Lepanto | 1571 | Europe/Middle East | Naval |
| 77 | `ottoman-siege-vienna-1683` | Siege of Vienna | 1683 | Europe | Military |
| 78 | `safavid-rise-1501` | Rise of the Safavid Empire | 1501 | Middle East | Political/Religious |
| 79 | `mughal-panipat-1526` | First Battle of Panipat | 1526 | Asia | Military |
| 80 | `abbasid-revolution-750` | Abbasid Revolution | 750 | Middle East | Revolution |

### Batch 5 — Age of Exploration & Early Modern (20)

| # | ID | Title | Date | Region | Type |
|---|-----|-------|------|--------|------|
| 81 | `columbus-1492` | Columbus Reaches the Americas | 1492 | Americas | Exploration |
| 82 | `magellan-circumnavigation-1519` | Magellan's Circumnavigation | 1519 | Global | Exploration |
| 83 | `tenochtitlan-1521` | Fall of Tenochtitlan | 1521 | Americas | Military |
| 84 | `inca-civil-war-1532` | Fall of the Inca Empire | 1532 | Americas | Political/Military |
| 85 | `luther-reformation-1517` | The Protestant Reformation | 1517 | Europe | Religious/Political |
| 86 | `thirty-years-war-1618` | Defenestration of Prague | 1618 | Europe | Political/Religious |
| 87 | `english-civil-war-1642` | English Civil War | 1642 | Europe | Revolution |
| 88 | `glorious-revolution-1688` | Glorious Revolution | 1688 | Europe | Political |
| 89 | `dutch-golden-age-1602` | Dutch East India Company | 1602 | Europe/Global | Economic |
| 90 | `tokugawa-sakoku-1635` | Japan's Isolation Policy | 1635 | Asia | Political |
| 91 | `zheng-he-voyages-1405` | Zheng He's Treasure Voyages | 1405 | Asia | Exploration |
| 92 | `imjin-war-1592` | Japanese Invasion of Korea | 1592 | Asia | Military/Naval |
| 93 | `sekigahara-1600` | Battle of Sekigahara | 1600 | Asia | Military |
| 94 | `qing-conquest-1644` | Fall of the Ming Dynasty | 1644 | Asia | Military/Political |
| 95 | `mughal-taj-mahal-1632` | Shah Jahan's Golden Age | 1632 | Asia | Cultural/Political |
| 96 | `portuguese-goa-1510` | Portuguese Conquest of Goa | 1510 | Asia | Military/Colonial |
| 97 | `spanish-philippines-1565` | Spanish Colonization of Philippines | 1565 | Asia | Colonial |
| 98 | `jamestown-1607` | Founding of Jamestown | 1607 | Americas | Colonial |
| 99 | `salem-witch-trials-1692` | Salem Witch Trials | 1692 | Americas | Political/Social |
| 100 | `great-fire-london-1666` | Great Fire of London | 1666 | Europe | Crisis |

### Batch 6 — Age of Revolution & Enlightenment (20)

| # | ID | Title | Date | Region | Type |
|---|-----|-------|------|--------|------|
| 101 | `haitian-revolution-1791` | Haitian Revolution | 1791 | Americas | Revolution |
| 102 | `louisiana-purchase-1803` | Louisiana Purchase | 1803 | Americas | Diplomatic |
| 103 | `simon-bolivar-1819` | Bolívar Crosses the Andes | 1819 | Americas | Military/Revolution |
| 104 | `mexican-independence-1810` | Mexican War of Independence | 1810 | Americas | Revolution |
| 105 | `greek-independence-1821` | Greek War of Independence | 1821 | Europe | Revolution |
| 106 | `revolutions-of-1848` | Revolutions of 1848 | 1848 | Europe | Revolution |
| 107 | `jacobite-rising-1745` | Jacobite Rising | 1745 | Europe | Military/Political |
| 108 | `seven-years-war-1757` | Battle of Plassey | 1757 | Asia | Military/Colonial |
| 109 | `catherine-great-1762` | Catherine the Great's Coup | 1762 | Europe | Political |
| 110 | `boston-tea-party-1773` | Boston Tea Party | 1773 | Americas | Political |
| 111 | `bastille-day-1789` | Storming of the Bastille | 1789 | Europe | Revolution |
| 112 | `reign-of-terror-1793` | Reign of Terror | 1793 | Europe | Political |
| 113 | `napoleon-egypt-1798` | Napoleon's Egyptian Campaign | 1798 | Africa/Europe | Military |
| 114 | `trafalgar-1805` | Battle of Trafalgar | 1805 | Europe | Naval |
| 115 | `napoleon-russia-1812` | Napoleon's Russian Campaign | 1812 | Europe | Military |
| 116 | `congress-of-vienna-1815` | Congress of Vienna | 1815 | Europe | Diplomatic |
| 117 | `taiping-rebellion-1850` | Taiping Rebellion | 1850 | Asia | Revolution |
| 118 | `commodore-perry-1853` | Perry's Expedition to Japan | 1853 | Asia | Diplomatic |
| 119 | `sepoy-mutiny-1857` | Indian Rebellion of 1857 | 1857 | Asia | Revolution |
| 120 | `opium-war-1839` | First Opium War | 1839 | Asia | Military/Diplomatic |

### Batch 7 — 19th Century: Nationalism & Imperialism (20)

| # | ID | Title | Date | Region | Type |
|---|-----|-------|------|--------|------|
| 121 | `american-civil-war-gettysburg-1863` | Battle of Gettysburg | 1863 | Americas | Military |
| 122 | `american-civil-war-emancipation-1863` | Emancipation Proclamation | 1863 | Americas | Political |
| 123 | `underground-railroad-1850` | Underground Railroad | 1850 | Americas | Political/Social |
| 124 | `crimean-war-1854` | Battle of Balaclava | 1854 | Europe | Military |
| 125 | `italian-unification-1860` | Garibaldi's Expedition of the Thousand | 1860 | Europe | Military/Political |
| 126 | `bismarck-sedan-1870` | Battle of Sedan | 1870 | Europe | Military |
| 127 | `paris-commune-1871` | Paris Commune | 1871 | Europe | Revolution |
| 128 | `zulu-isandlwana-1879` | Battle of Isandlwana | 1879 | Africa | Military |
| 129 | `zulu-rorkes-drift-1879` | Battle of Rorke's Drift | 1879 | Africa | Military |
| 130 | `scramble-for-africa-1884` | Berlin Conference | 1884 | Africa | Diplomatic |
| 131 | `russo-turkish-war-1877` | Siege of Plevna | 1877 | Europe | Military |
| 132 | `boxer-rebellion-1900` | Boxer Rebellion | 1900 | Asia | Revolution |
| 133 | `boer-war-1899` | Second Boer War | 1899 | Africa | Military |
| 134 | `russo-japanese-war-1905` | Battle of Tsushima | 1905 | Asia | Naval |
| 135 | `mexican-american-war-1846` | Battle of Buena Vista | 1846 | Americas | Military |
| 136 | `trail-of-tears-1838` | Trail of Tears | 1838 | Americas | Political |
| 137 | `gold-rush-1849` | California Gold Rush | 1849 | Americas | Economic/Social |
| 138 | `little-bighorn-1876` | Battle of Little Bighorn | 1876 | Americas | Military |
| 139 | `wounded-knee-1890` | Wounded Knee Massacre | 1890 | Americas | Military/Political |
| 140 | `spanish-american-war-1898` | Battle of Manila Bay | 1898 | Americas/Asia | Naval |

### Batch 8 — World War I (20)

| # | ID | Title | Date | Region | Type |
|---|-----|-------|------|--------|------|
| 141 | `assassination-sarajevo-1914` | Assassination at Sarajevo | 1914 | Europe | Political |
| 142 | `battle-of-marne-1914` | First Battle of the Marne | 1914 | Europe | Military |
| 143 | `gallipoli-1915` | Gallipoli Campaign | 1915 | Europe/Middle East | Military |
| 144 | `jutland-1916` | Battle of Jutland | 1916 | Europe | Naval |
| 145 | `somme-1916` | Battle of the Somme | 1916 | Europe | Military |
| 146 | `passchendaele-1917` | Battle of Passchendaele | 1917 | Europe | Military |
| 147 | `russian-revolution-1917` | Russian Revolution | 1917 | Europe | Revolution |
| 148 | `spring-offensive-1918` | German Spring Offensive | 1918 | Europe | Military |
| 149 | `armenian-genocide-1915` | Armenian Genocide | 1915 | Middle East | Humanitarian |
| 150 | `balfour-declaration-1917` | Balfour Declaration | 1917 | Middle East | Political/Diplomatic |
| 151 | `lawrence-arabia-1917` | Arab Revolt | 1917 | Middle East | Military/Political |
| 152 | `treaty-of-versailles-1919` | Treaty of Versailles | 1919 | Global | Diplomatic |
| 153 | `treaty-of-brest-litovsk-1918` | Treaty of Brest-Litovsk | 1918 | Europe | Diplomatic |
| 154 | `finnish-civil-war-1918` | Finnish Civil War | 1918 | Europe | Revolution |
| 155 | `tannenberg-1914` | Battle of Tannenberg | 1914 | Europe | Military |
| 156 | `lusitania-1915` | Sinking of the Lusitania | 1915 | Global | Naval/Political |
| 157 | `zimmermann-telegram-1917` | Zimmermann Telegram | 1917 | Global | Political/Espionage |
| 158 | `meuse-argonne-1918` | Meuse-Argonne Offensive | 1918 | Europe | Military |
| 159 | `chinese-warlord-era-1916` | Chinese Warlord Era | 1916 | Asia | Political/Military |
| 160 | `irish-easter-rising-1916` | Easter Rising | 1916 | Europe | Revolution |

### Batch 9 — Interwar & Rise of Totalitarianism (20)

| # | ID | Title | Date | Region | Type |
|---|-----|-------|------|--------|------|
| 161 | `russian-civil-war-1918` | Russian Civil War | 1918 | Europe | Military/Political |
| 162 | `weimar-hyperinflation-1923` | Weimar Hyperinflation | 1923 | Europe | Economic/Political |
| 163 | `beer-hall-putsch-1923` | Beer Hall Putsch | 1923 | Europe | Political |
| 164 | `long-march-1934` | The Long March | 1934 | Asia | Military/Political |
| 165 | `spanish-civil-war-1936` | Spanish Civil War | 1936 | Europe | Military/Political |
| 166 | `gandhi-salt-march-1930` | Salt March | 1930 | Asia | Political/Revolution |
| 167 | `manchurian-incident-1931` | Manchurian Incident | 1931 | Asia | Military/Political |
| 168 | `rape-of-nanjing-1937` | Battle of Shanghai & Nanjing | 1937 | Asia | Military |
| 169 | `munich-agreement-1938` | Munich Agreement | 1938 | Europe | Diplomatic |
| 170 | `kristallnacht-1938` | Kristallnacht | 1938 | Europe | Political |
| 171 | `ethiopian-war-1935` | Italian Invasion of Ethiopia | 1935 | Africa | Military |
| 172 | `turkish-independence-1922` | Turkish War of Independence | 1922 | Middle East | Military/Political |
| 173 | `wall-street-crash-1929` | Wall Street Crash | 1929 | Americas | Economic |
| 174 | `reichstag-fire-1933` | Reichstag Fire | 1933 | Europe | Political |
| 175 | `night-of-long-knives-1934` | Night of the Long Knives | 1934 | Europe | Political |
| 176 | `abdication-crisis-1936` | Abdication Crisis | 1936 | Europe | Political |
| 177 | `anschluss-1938` | Anschluss of Austria | 1938 | Europe | Political |
| 178 | `molotov-ribbentrop-1939` | Molotov-Ribbentrop Pact | 1939 | Europe | Diplomatic |
| 179 | `winter-war-1939` | Winter War | 1939 | Europe | Military |
| 180 | `invasion-of-poland-1939` | Invasion of Poland | 1939 | Europe | Military |

### Batch 10 — World War II (20)

| # | ID | Title | Date | Region | Type |
|---|-----|-------|------|--------|------|
| 181 | `dunkirk-1940` | Dunkirk Evacuation | 1940 | Europe | Military |
| 182 | `battle-of-britain-1940` | Battle of Britain | 1940 | Europe | Military |
| 183 | `fall-of-france-1940` | Fall of France | 1940 | Europe | Military |
| 184 | `pearl-harbor-1941` | Attack on Pearl Harbor | 1941 | Pacific | Military |
| 185 | `siege-of-leningrad-1941` | Siege of Leningrad | 1941 | Europe | Military |
| 186 | `stalingrad-1942` | Battle of Stalingrad | 1942 | Europe | Military |
| 187 | `el-alamein-1942` | Battle of El Alamein | 1942 | Africa | Military |
| 188 | `guadalcanal-1942` | Battle of Guadalcanal | 1942 | Pacific | Military |
| 189 | `kursk-1943` | Battle of Kursk | 1943 | Europe | Military |
| 190 | `sicily-invasion-1943` | Allied Invasion of Sicily | 1943 | Europe | Military |
| 191 | `warsaw-uprising-1944` | Warsaw Uprising | 1944 | Europe | Military/Revolution |
| 192 | `market-garden-1944` | Operation Market Garden | 1944 | Europe | Military |
| 193 | `battle-of-bulge-1944` | Battle of the Bulge | 1944 | Europe | Military |
| 194 | `iwo-jima-1945` | Battle of Iwo Jima | 1945 | Pacific | Military |
| 195 | `okinawa-1945` | Battle of Okinawa | 1945 | Pacific | Military |
| 196 | `fall-of-berlin-1945` | Fall of Berlin | 1945 | Europe | Military |
| 197 | `hiroshima-1945` | Atomic Bombing Decision | 1945 | Pacific | Military/Political |
| 198 | `yalta-conference-1945` | Yalta Conference | 1945 | Global | Diplomatic |
| 199 | `burma-campaign-1944` | Burma Campaign | 1944 | Asia | Military |
| 200 | `resistance-france-1943` | French Resistance | 1943 | Europe | Military/Political |

### Batch 11 — Cold War: Early Phase (20)

| # | ID | Title | Date | Region | Type |
|---|-----|-------|------|--------|------|
| 201 | `nuremberg-trials-1945` | Nuremberg Trials | 1945 | Europe | Political/Legal |
| 202 | `partition-of-india-1947` | Partition of India | 1947 | Asia | Political |
| 203 | `israeli-independence-1948` | Israeli War of Independence | 1948 | Middle East | Military/Political |
| 204 | `berlin-blockade-1948` | Berlin Blockade | 1948 | Europe | Political |
| 205 | `chinese-civil-war-1948` | Huaihai Campaign | 1948 | Asia | Military |
| 206 | `korean-war-inchon-1950` | Battle of Inchon | 1950 | Asia | Military |
| 207 | `korean-war-chosin-1950` | Battle of Chosin Reservoir | 1950 | Asia | Military |
| 208 | `mau-mau-uprising-1952` | Mau Mau Uprising | 1952 | Africa | Revolution |
| 209 | `hungarian-revolution-1956` | Hungarian Revolution | 1956 | Europe | Revolution |
| 210 | `suez-crisis-1956` | Suez Crisis | 1956 | Middle East | Political/Military |
| 211 | `sputnik-1957` | Sputnik Launch | 1957 | Global | Scientific/Political |
| 212 | `great-leap-forward-1958` | Great Leap Forward | 1958 | Asia | Political/Economic |
| 213 | `bay-of-pigs-1961` | Bay of Pigs Invasion | 1961 | Americas | Military/Political |
| 214 | `construction-berlin-wall-1961` | Construction of Berlin Wall | 1961 | Europe | Political |
| 215 | `algerian-war-1954` | Algerian War of Independence | 1954 | Africa | Revolution |
| 216 | `congo-crisis-1960` | Congo Crisis | 1960 | Africa | Political |
| 217 | `u2-incident-1960` | U-2 Incident | 1960 | Global | Espionage/Political |
| 218 | `nuclear-tests-bikini-1946` | Operation Crossroads | 1946 | Pacific | Political/Scientific |
| 219 | `marshall-plan-1948` | Marshall Plan | 1948 | Europe | Economic/Diplomatic |
| 220 | `nato-founding-1949` | Founding of NATO | 1949 | Global | Diplomatic |

### Batch 12 — Cold War: Late Phase & Decolonization (20)

| # | ID | Title | Date | Region | Type |
|---|-----|-------|------|--------|------|
| 221 | `six-day-war-1967` | Six-Day War | 1967 | Middle East | Military |
| 222 | `tet-offensive-1968` | Tet Offensive | 1968 | Asia | Military |
| 223 | `prague-spring-1968` | Prague Spring | 1968 | Europe | Political/Revolution |
| 224 | `moon-landing-1969` | Apollo 11 Moon Landing | 1969 | Global | Scientific/Exploration |
| 225 | `yom-kippur-war-1973` | Yom Kippur War | 1973 | Middle East | Military |
| 226 | `chilean-coup-1973` | Chilean Coup d'État | 1973 | Americas | Political |
| 227 | `fall-of-saigon-1975` | Fall of Saigon | 1975 | Asia | Military/Political |
| 228 | `khmer-rouge-1975` | Khmer Rouge Takeover | 1975 | Asia | Political |
| 229 | `iranian-revolution-1979` | Iranian Revolution | 1979 | Middle East | Revolution |
| 230 | `soviet-afghanistan-1979` | Soviet Invasion of Afghanistan | 1979 | Asia | Military |
| 231 | `falklands-war-1982` | Falklands War | 1982 | Americas | Military |
| 232 | `solidarity-poland-1980` | Solidarity Movement | 1980 | Europe | Political |
| 233 | `biafra-war-1967` | Biafran War | 1967 | Africa | Military/Political |
| 234 | `bangladesh-independence-1971` | Bangladesh Liberation War | 1971 | Asia | Military/Revolution |
| 235 | `angolan-civil-war-1975` | Angolan Civil War | 1975 | Africa | Military/Political |
| 236 | `camp-david-accords-1978` | Camp David Accords | 1978 | Middle East | Diplomatic |
| 237 | `oil-crisis-1973` | Oil Crisis | 1973 | Global | Economic/Political |
| 238 | `chernobyl-1986` | Chernobyl Disaster | 1986 | Europe | Crisis/Political |
| 239 | `tiananmen-1989` | Tiananmen Square | 1989 | Asia | Political |
| 240 | `fall-of-soviet-union-1991` | Fall of the Soviet Union | 1991 | Europe/Asia | Political |

### Batch 13 — Post-Cold War & Modern Crises (20)

| # | ID | Title | Date | Region | Type |
|---|-----|-------|------|--------|------|
| 241 | `gulf-war-1991` | Gulf War | 1991 | Middle East | Military |
| 242 | `rwandan-crisis-1994` | Rwandan Crisis | 1994 | Africa | Humanitarian |
| 243 | `bosnian-war-1995` | Siege of Sarajevo | 1992 | Europe | Military/Humanitarian |
| 244 | `nelson-mandela-1990` | Release of Nelson Mandela | 1990 | Africa | Political |
| 245 | `hong-kong-handover-1997` | Hong Kong Handover | 1997 | Asia | Political/Diplomatic |
| 246 | `mexican-revolution-1910` | Mexican Revolution | 1910 | Americas | Revolution |
| 247 | `apartheid-soweto-1976` | Soweto Uprising | 1976 | Africa | Revolution |
| 248 | `lebanon-civil-war-1975` | Lebanese Civil War | 1975 | Middle East | Military/Political |
| 249 | `indo-pakistan-war-1965` | Indo-Pakistani War | 1965 | Asia | Military |
| 250 | `sino-vietnamese-war-1979` | Sino-Vietnamese War | 1979 | Asia | Military |
| 251 | `sri-lanka-civil-war-1983` | Sri Lankan Civil War | 1983 | Asia | Military/Political |
| 252 | `colombian-drug-war-1989` | Colombian Drug War | 1989 | Americas | Political/Military |
| 253 | `panama-invasion-1989` | Invasion of Panama | 1989 | Americas | Military |
| 254 | `first-intifada-1987` | First Intifada | 1987 | Middle East | Political |
| 255 | `ethiopian-revolution-1974` | Ethiopian Revolution | 1974 | Africa | Revolution |
| 256 | `mogadishu-1993` | Battle of Mogadishu | 1993 | Africa | Military |
| 257 | `east-timor-independence-1999` | East Timor Independence | 1999 | Asia | Political/Military |
| 258 | `northern-ireland-troubles-1972` | Bloody Sunday | 1972 | Europe | Political |
| 259 | `cuban-revolution-1959` | Cuban Revolution | 1959 | Americas | Revolution |
| 260 | `guatemalan-civil-war-1960` | Guatemalan Civil War | 1960 | Americas | Military/Political |

### Batch 14 — Cultural, Scientific & Economic Turning Points (20)

| # | ID | Title | Date | Region | Type |
|---|-----|-------|------|--------|------|
| 261 | `printing-press-1440` | Gutenberg's Printing Press | 1440 | Europe | Scientific/Cultural |
| 262 | `galileo-trial-1633` | Trial of Galileo | 1633 | Europe | Scientific/Religious |
| 263 | `industrial-revolution-1769` | Industrial Revolution | 1769 | Europe | Economic/Scientific |
| 264 | `abolition-slave-trade-1807` | Abolition of the Slave Trade | 1807 | Global | Political/Social |
| 265 | `irish-famine-1845` | Irish Potato Famine | 1845 | Europe | Crisis/Political |
| 266 | `suez-canal-1869` | Opening of the Suez Canal | 1869 | Middle East | Economic/Engineering |
| 267 | `meiji-constitution-1889` | Meiji Constitution | 1889 | Asia | Political/Legal |
| 268 | `wright-brothers-1903` | First Powered Flight | 1903 | Americas | Scientific |
| 269 | `titanic-1912` | Sinking of the Titanic | 1912 | Global | Crisis |
| 270 | `russian-famine-1921` | Russian Famine | 1921 | Europe | Humanitarian |
| 271 | `penicillin-discovery-1928` | Discovery of Penicillin | 1928 | Europe | Scientific |
| 272 | `manhattan-project-1942` | Manhattan Project | 1942 | Americas | Scientific/Military |
| 273 | `bretton-woods-1944` | Bretton Woods Conference | 1944 | Global | Economic/Diplomatic |
| 274 | `un-founding-1945` | Founding of the United Nations | 1945 | Global | Diplomatic |
| 275 | `brown-v-board-1954` | Brown v. Board of Education | 1954 | Americas | Political/Legal |
| 276 | `march-on-washington-1963` | March on Washington | 1963 | Americas | Political/Social |
| 277 | `stonewall-riots-1969` | Stonewall Riots | 1969 | Americas | Political/Social |
| 278 | `environmental-movement-1970` | First Earth Day | 1970 | Americas | Political/Environmental |
| 279 | `aids-crisis-1981` | AIDS Crisis | 1981 | Global | Humanitarian/Scientific |
| 280 | `internet-revolution-1991` | Birth of the World Wide Web | 1991 | Global | Scientific |

### Batch 15 — Remaining Gaps & Unique Perspectives (4)

| # | ID | Title | Date | Region | Type |
|---|-----|-------|------|--------|------|
| 281 | `polynesian-navigation-1000` | Polynesian Navigation to New Zealand | ~1000 | Oceania | Exploration |
| 282 | `aboriginal-contact-1788` | First Fleet Arrives in Australia | 1788 | Oceania | Colonial |
| 283 | `maori-wars-1845` | New Zealand Wars | 1845 | Oceania | Military/Colonial |
| 284 | `treaty-of-waitangi-1840` | Treaty of Waitangi | 1840 | Oceania | Diplomatic/Colonial |

---

## Final Totals After Completion

| Metric | Before | After |
|--------|--------|-------|
| **Total scenarios** | **16** | **300** |
| Europe | 10 | ~85 |
| Asia | 3 | ~55 |
| Americas | 2 | ~40 |
| Africa & Middle East | 1 | ~55 |
| Pacific & Oceania | 0 | ~10 |
| Global / Cross-regional | 0 | ~15 |

### By Type
| Type | Before | After |
|------|--------|-------|
| Military | 13 | ~120 |
| Political/Diplomatic | 2 | ~70 |
| Revolution | 1 | ~25 |
| Economic/Scientific | 0 | ~20 |
| Cultural/Religious | 0 | ~20 |
| Exploration/Colonial | 0 | ~15 |
| Humanitarian/Crisis | 0 | ~15 |
| Legal/Social | 0 | ~15 |

### By Era
| Era | Before | After |
|-----|--------|-------|
| Ancient (before 500 AD) | 4 | ~45 |
| Medieval (500–1400) | 2 | ~35 |
| Early Modern (1400–1750) | 2 | ~30 |
| Age of Revolution (1750–1850) | 3 | ~25 |
| 19th Century (1850–1914) | 1 | ~25 |
| World War I (1914–1918) | 1 | ~20 |
| Interwar (1918–1939) | 0 | ~20 |
| World War II (1939–1945) | 2 | ~25 |
| Cold War (1945–1991) | 2 | ~45 |
| Post-Cold War (1991+) | 1 | ~20 |

### Time Span
1274 BC — 1999 AD

---

## Per-Scenario Checklist
- [ ] `scenario.json` with full trilingual strings (en, ja, zh-CN)
- [ ] 1 role with briefing, objectives, constraints, pressures, initialState
- [ ] 3-4 key figures with descriptions
- [ ] `history.json` with 5-8 timeline events, outcome, casualties, significance
- [ ] 3 scenes, each with 2 choices
- [ ] Each choice: trilingual text, historicalContext, outcomePrompt, stateChanges
- [ ] Scene flow: scene-001 → scene-002 → scene-003 (terminal)
- [ ] 3-5 state variables per scenario
- [ ] Manifest entry added
