const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('E:/dev/timeline_commander/content/manifest.json', 'utf8'));

const asiaRegion = {
  "id": "ancient-classical-asia",
  "name": { "en": "Ancient & Classical Asia", "ja": "古代・古典アジア", "zh-CN": "古代与古典亚洲" },
  "eras": [
    {
      "id": "warring-states-han",
      "name": { "en": "Warring States & Han Dynasty", "ja": "戦国時代・漢朝", "zh-CN": "战国与汉朝" },
      "dateRange": "260 BC – 133 BC",
      "scenarios": [
        {
          "id": "warring-states-changping-260bc",
          "title": { "en": "Battle of Changping", "ja": "長平の戦い", "zh-CN": "长平之战" },
          "brief": { "en": "Zhao Kuo replaces a proven general — and leads 400,000 men into a Qin trap", "ja": "実績ある将軍の後任となった趙括が、40万の兵を秦の罠へ導く", "zh-CN": "赵括替代老将，将四十万大军带入秦国的陷阱" },
          "dates": { "start": "0260-07-01-BC", "end": "0260-09-01-BC" },
          "difficulty": "hard",
          "roleCount": 1
        },
        {
          "id": "qin-unification-221bc",
          "title": { "en": "Qin Unification of China", "ja": "秦の中国統一", "zh-CN": "秦统一中国" },
          "brief": { "en": "Ying Zheng conquers the last kingdoms — and must decide how to rule an empire no one has ever built before", "ja": "嬴政が最後の王国を征服し、かつて誰も築いたことのない帝国をいかに統治するか決断する", "zh-CN": "嬴政征服最后的王国——必须决定如何统治这个前所未有的帝国" },
          "dates": { "start": "0221-03-01-BC", "end": "0221-12-01-BC" },
          "difficulty": "advanced",
          "roleCount": 1
        },
        {
          "id": "fall-of-qin-207bc",
          "title": { "en": "Fall of the Qin Dynasty", "ja": "秦朝の崩壊", "zh-CN": "秦朝的覆灭" },
          "brief": { "en": "Xiang Yu destroys the Qin army — but victory brings impossible choices", "ja": "項羽が秦軍を壊滅させる——しかし勝利は不可能な選択をもたらす", "zh-CN": "项羽摧毁秦军——但胜利带来了艰难抉择" },
          "dates": { "start": "0207-10-01-BC", "end": "0207-12-01-BC" },
          "difficulty": "hard",
          "roleCount": 1
        },
        {
          "id": "chu-han-contention-202bc",
          "title": { "en": "Chu-Han Contention — Battle of Gaixia", "ja": "楚漢の争い — 垓下の戦い", "zh-CN": "楚汉相争 — 垓下之战" },
          "brief": { "en": "Xiang Yu, surrounded by 300,000 Han soldiers, hears the songs of Chu — and faces his last choice", "ja": "30万の漢軍に包囲された項羽が楚の歌を聞き、最後の選択に直面する", "zh-CN": "项羽被三十万汉军包围，四面楚歌，直面最后的抉择" },
          "dates": { "start": "0202-01-01-BC", "end": "0202-03-01-BC" },
          "difficulty": "hard",
          "roleCount": 1
        },
        {
          "id": "han-xiongnu-war-133bc",
          "title": { "en": "Han-Xiongnu War — The Mayi Ambush", "ja": "漢匈奴戦争 — 馬邑の計略", "zh-CN": "汉匈奴战争 — 马邑之谋" },
          "brief": { "en": "Emperor Wu ends 70 years of tribute payments and bets China's future on a bold ambush", "ja": "武帝が70年の貢納政策に終止符を打ち、大胆な奇襲で中国の未来を賭ける", "zh-CN": "汉武帝终结七十年的纳贡政策，以大胆的伏击赌上中国的未来" },
          "dates": { "start": "0133-01-01-BC", "end": "0119-01-01-BC" },
          "difficulty": "intermediate",
          "roleCount": 1
        }
      ]
    },
    {
      "id": "three-kingdoms-silk-road",
      "name": { "en": "Three Kingdoms, Classical India & the Silk Road", "ja": "三国時代・古典インド・シルクロード", "zh-CN": "三国时代、古典印度与丝绸之路" },
      "dateRange": "322 BC – 234 AD",
      "scenarios": [
        {
          "id": "chandragupta-maurya-322bc",
          "title": { "en": "Rise of the Maurya Empire", "ja": "マウリヤ朝の興隆", "zh-CN": "孔雀王朝的崛起" },
          "brief": { "en": "Chandragupta and Chanakya overthrow the Nandas — and build India's first continental empire", "ja": "チャンドラグプタとカウティリヤがナンダ朝を打倒し、インド初の大陸帝国を築く", "zh-CN": "旃陀罗笈多与考底利耶推翻难陀王朝，建立印度第一个大陆帝国" },
          "dates": { "start": "0322-01-01-BC", "end": "0305-01-01-BC" },
          "difficulty": "intermediate",
          "roleCount": 1
        },
        {
          "id": "ashoka-kalinga-261bc",
          "title": { "en": "Ashoka and the Kalinga War", "ja": "アショーカとカリンガ戦争", "zh-CN": "阿育王与羯陵伽战争" },
          "brief": { "en": "100,000 dead — and the emperor who saw the battlefield and could never be the same again", "ja": "10万の死者——戦場を見て、二度と元の自分には戻れなかった皇帝", "zh-CN": "十万人死亡——那位目睹战场后再也无法回到过去的皇帝" },
          "dates": { "start": "0261-01-01-BC", "end": "0260-01-01-BC" },
          "difficulty": "intermediate",
          "roleCount": 1
        },
        {
          "id": "silk-road-crisis-100",
          "title": { "en": "Ban Chao's Mission — The Silk Road Crisis", "ja": "班超の西域経略", "zh-CN": "班超经略西域" },
          "brief": { "en": "36 men, 30 years, 50 kingdoms — the Han clerk who became master of Central Asia", "ja": "36人・30年・50の王国——中央アジアの覇者となった漢の書記", "zh-CN": "三十六人、三十年、五十个王国——成为中亚之主的汉朝书吏" },
          "dates": { "start": "0073-01-01", "end": "0102-01-01" },
          "difficulty": "advanced",
          "roleCount": 1
        },
        {
          "id": "three-kingdoms-guandu-200",
          "title": { "en": "Battle of Guandu", "ja": "官渡の戦い", "zh-CN": "官渡之战" },
          "brief": { "en": "Cao Cao's 30,000 vs Yuan Shao's 100,000 — and the defector who changed history", "ja": "曹操の3万対袁紹の10万——そして歴史を変えた裏切り者", "zh-CN": "曹操三万对袁绍十万——以及那个改变历史的叛徒" },
          "dates": { "start": "0200-01-01", "end": "0200-12-31" },
          "difficulty": "hard",
          "roleCount": 1
        },
        {
          "id": "fall-of-han-220",
          "title": { "en": "Fall of the Han Dynasty", "ja": "漢朝の滅亡", "zh-CN": "汉朝的灭亡" },
          "brief": { "en": "The last Han emperor faces an ultimatum — dignity or survival", "ja": "最後の漢の皇帝が最後通牒に直面する——尊厳か生存か", "zh-CN": "最后一位汉朝皇帝面临最后通牒——尊严还是生存" },
          "dates": { "start": "0220-01-01", "end": "0220-12-01" },
          "difficulty": "intermediate",
          "roleCount": 1
        },
        {
          "id": "zhuge-liang-northern-228",
          "title": { "en": "Zhuge Liang's Northern Expeditions", "ja": "諸葛亮の北伐", "zh-CN": "诸葛亮北伐" },
          "brief": { "en": "The genius strategist appoints an untested favorite to a critical pass — and pays the price", "ja": "天才軍師が未熟な腹心を要衝の守備に任命し、その代償を払う", "zh-CN": "天才谋士将未经考验的心腹任命镇守要隘——并付出了代价" },
          "dates": { "start": "0228-01-01", "end": "0234-10-01" },
          "difficulty": "hard",
          "roleCount": 1
        },
        {
          "id": "kushan-empire-127",
          "title": { "en": "Kanishka and the Kushan Empire", "ja": "カニシカとクシャーナ朝", "zh-CN": "迦腻色迦与贵霜帝国" },
          "brief": { "en": "Master of the Silk Road — the Buddhist king who balanced trade, faith, and empire", "ja": "シルクロードの覇者——交易・信仰・帝国のバランスをとった仏教王", "zh-CN": "丝绸之路的主宰——在贸易、信仰与帝国之间寻求平衡的佛教国王" },
          "dates": { "start": "0127-01-01", "end": "0150-01-01" },
          "difficulty": "intermediate",
          "roleCount": 1
        }
      ]
    },
    {
      "id": "medieval-asia",
      "name": { "en": "Medieval Asia", "ja": "中世アジア", "zh-CN": "中世纪亚洲" },
      "dateRange": "250 AD – 1185 AD",
      "scenarios": [
        {
          "id": "funan-kingdom-250",
          "title": { "en": "Rise of Funan", "ja": "扶南の興隆", "zh-CN": "扶南王国的崛起" },
          "brief": { "en": "Southeast Asia's first great kingdom — where Indian culture met the Mekong Delta", "ja": "東南アジア初の大国——インド文化がメコンデルタと出会う", "zh-CN": "东南亚第一个伟大王国——印度文化与湄公河三角洲的相遇" },
          "dates": { "start": "0250-01-01", "end": "0300-01-01" },
          "difficulty": "intermediate",
          "roleCount": 1
        },
        {
          "id": "goguryeo-sui-war-612",
          "title": { "en": "Goguryeo-Sui War", "ja": "高句麗・隋戦争", "zh-CN": "高句丽与隋朝之战" },
          "brief": { "en": "One million Sui soldiers march into Korea — and only 2,700 return", "ja": "100万の隋軍が朝鮮半島に侵攻し、生還したのはわずか2,700人", "zh-CN": "百万隋军进入朝鲜半岛——只有两千七百人归还" },
          "dates": { "start": "0612-01-01", "end": "0614-01-01" },
          "difficulty": "hard",
          "roleCount": 1
        },
        {
          "id": "baekgang-663",
          "title": { "en": "Battle of Baekgang", "ja": "白村江の戦い", "zh-CN": "白江口之战" },
          "brief": { "en": "Japan's fleet vs Tang China — the naval disaster that reshaped Japan's identity for centuries", "ja": "日本の艦隊対唐中国——何世紀も日本のアイデンティティを形作った海戦の惨事", "zh-CN": "日本舰队对唐帝国——塑造日本数百年认同的海战惨败" },
          "dates": { "start": "0663-08-01", "end": "0663-08-28" },
          "difficulty": "hard",
          "roleCount": 1
        },
        {
          "id": "srivijaya-trade-700",
          "title": { "en": "Srivijaya Maritime Empire", "ja": "シュリーヴィジャヤ海上帝国", "zh-CN": "室利佛逝海洋帝国" },
          "brief": { "en": "Masters of the Strait of Malacca — ruling the world's greatest trade route through gold and naval power", "ja": "マラッカ海峡の覇者——金と海軍力で世界最大の交易路を支配する", "zh-CN": "马六甲海峡的主宰——以黄金与海军统治世界最重要的贸易航道" },
          "dates": { "start": "0700-01-01", "end": "0750-01-01" },
          "difficulty": "intermediate",
          "roleCount": 1
        },
        {
          "id": "nara-heian-transition-794",
          "title": { "en": "Transfer to Heian — The Capital Decision", "ja": "平安遷都", "zh-CN": "迁都平安" },
          "brief": { "en": "Emperor Kanmu escapes Buddhist political power — and chooses a city that will endure 1,000 years", "ja": "桓武天皇が仏教政治権力から逃れ、1000年続く都を選ぶ", "zh-CN": "桓武天皇摆脱佛教政治势力——选择了一座延续千年的都城" },
          "dates": { "start": "0794-10-01", "end": "0794-12-01" },
          "difficulty": "intermediate",
          "roleCount": 1
        },
        {
          "id": "talas-751",
          "title": { "en": "Battle of Talas", "ja": "タラスの戦い", "zh-CN": "怛罗斯之战" },
          "brief": { "en": "Tang China meets the Abbasid Caliphate — and Karluk mercenaries choose a side", "ja": "唐とアッバース朝が激突——カルルク傭兵が陣営を選ぶ", "zh-CN": "唐帝国与阿拔斯王朝相遇——葛逻禄雇佣兵选择了阵营" },
          "dates": { "start": "0751-07-01", "end": "0751-07-01" },
          "difficulty": "hard",
          "roleCount": 1
        },
        {
          "id": "khmer-empire-angkor-1177",
          "title": { "en": "Siege of Angkor by the Cham", "ja": "チャム族によるアンコールの包囲", "zh-CN": "占城围攻吴哥" },
          "brief": { "en": "The Cham sack Angkor — and a Khmer prince rises from the jungle to reclaim everything", "ja": "チャムがアンコールを略奪し、クメールの王子がジャングルから立ち上がりすべてを奪還する", "zh-CN": "占城军队洗劫吴哥——一位高棉王子从丛林中崛起，夺回一切" },
          "dates": { "start": "1177-01-01", "end": "1181-01-01" },
          "difficulty": "hard",
          "roleCount": 1
        },
        {
          "id": "genpei-war-1185",
          "title": { "en": "Genpei War — Battle of Dan-no-ura", "ja": "源平合戦 — 壇ノ浦の戦い", "zh-CN": "源平合战 — 坛之浦之战" },
          "brief": { "en": "The last stand of the Taira — a child emperor, a sacred sword, and the sea", "ja": "平氏の最後の抵抗——幼い天皇、神剣、そして海", "zh-CN": "平氏的最后抵抗——幼帝、神剑，与大海" },
          "dates": { "start": "1185-04-25", "end": "1185-04-25" },
          "difficulty": "intermediate",
          "roleCount": 1
        }
      ]
    }
  ]
};

manifest.regions.push(asiaRegion);

const total = manifest.regions.reduce((sum, r) => sum + r.eras.reduce((s2, e) => s2 + e.scenarios.length, 0), 0);
console.log('New manifest total:', total);

fs.writeFileSync('E:/dev/timeline_commander/content/manifest.json', JSON.stringify(manifest, null, 2));
console.log('Manifest updated successfully.');
